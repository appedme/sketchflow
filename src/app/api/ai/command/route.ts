import type { TextStreamPart, ToolSet } from 'ai';
import type { NextRequest } from 'next/server';

import { createOpenAI } from '@ai-sdk/openai';
import { InvalidArgumentError } from '@ai-sdk/provider';
import { delay as originalDelay } from '@ai-sdk/provider-utils';
import { convertToCoreMessages, streamText } from 'ai';
import { NextResponse } from 'next/server';

// Pollinations.AI API client
class PollinationsAI {
  private baseUrl = 'https://text.pollinations.ai';

  async generateText(prompt: string, options: {
    model?: string;
    system?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}) {
    const { model = 'openai', system, maxTokens = 2048, temperature = 0.7 } = options;

    // Combine system and user prompt
    const fullPrompt = system ? `${system}\n\nUser: ${prompt}` : prompt;

    try {
      const response = await fetch(`${this.baseUrl}/openai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            ...(system ? [{ role: 'system', content: system }] : []),
            { role: 'user', content: prompt }
          ],
          max_tokens: maxTokens,
          temperature: temperature,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`Pollinations API error: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error('Pollinations.AI error:', error);
      throw error;
    }
  }

  async generateImage(prompt: string, options: {
    width?: number;
    height?: number;
    model?: string;
    seed?: number;
  } = {}) {
    const { width = 1024, height = 1024, model = 'flux', seed } = options;

    const params = new URLSearchParams({
      width: width.toString(),
      height: height.toString(),
      model,
      ...(seed && { seed: seed.toString() })
    });

    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;

    return {
      url: imageUrl,
      prompt,
      model,
      width,
      height
    };
  }
}

/**
 * Detects the first chunk in a buffer.
 *
 * @param buffer - The buffer to detect the first chunk in.
 * @returns The first detected chunk, or `undefined` if no chunk was detected.
 */
export type ChunkDetector = (buffer: string) => string | null | undefined;

type delayer = (buffer: string) => number;

/**
 * Smooths text streaming output.
 *
 * @param delayInMs - The delay in milliseconds between each chunk. Defaults to
 *   10ms. Can be set to `null` to skip the delay.
 * @param chunking - Controls how the text is chunked for streaming. Use "word"
 *   to stream word by word (default), "line" to stream line by line, or provide
 *   a custom RegExp pattern for custom chunking.
 * @returns A transform stream that smooths text streaming output.
 */
function smoothStream<TOOLS extends ToolSet>({
  _internal: { delay = originalDelay } = {},
  chunking = 'word',
  delayInMs = 10,
}: {
  /** Internal. For test use only. May change without notice. */
  _internal?: {
    delay?: (delayInMs: number | null) => Promise<void>;
  };
  chunking?: ChunkDetector | RegExp | 'line' | 'word';
  delayInMs?: delayer | number | null;
} = {}): (options: {
  tools: TOOLS;
}) => TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>> {
  let detectChunk: ChunkDetector;

  if (typeof chunking === 'function') {
    detectChunk = (buffer) => {
      const match = chunking(buffer);

      if (match == null) {
        return null;
      }

      if (match.length === 0) {
        throw new Error(`Chunking function must return a non-empty string.`);
      }

      if (!buffer.startsWith(match)) {
        throw new Error(
          `Chunking function must return a match that is a prefix of the buffer. Received: "${match}" expected to start with "${buffer}"`
        );
      }

      return match;
    };
  } else {
    const chunkingRegex =
      typeof chunking === 'string' ? CHUNKING_REGEXPS[chunking] : chunking;

    if (chunkingRegex == null) {
      throw new InvalidArgumentError({
        argument: 'chunking',
        message: `Chunking must be "word" or "line" or a RegExp. Received: ${chunking}`,
      });
    }

    detectChunk = (buffer) => {
      const match = chunkingRegex.exec(buffer);

      if (!match) {
        return null;
      }

      return buffer.slice(0, match.index) + match?.[0];
    };
  }

  return () => {
    let buffer = '';

    return new TransformStream<TextStreamPart<TOOLS>, TextStreamPart<TOOLS>>({
      async transform(chunk, controller) {
        if (chunk.type !== 'text-delta') {
          console.info(buffer, 'finished');

          if (buffer.length > 0) {
            controller.enqueue({ textDelta: buffer, type: 'text-delta' });
            buffer = '';
          }

          controller.enqueue(chunk);
          return;
        }

        buffer += chunk.textDelta;

        let match;

        while ((match = detectChunk(buffer)) != null) {
          controller.enqueue({ textDelta: match, type: 'text-delta' });
          buffer = buffer.slice(match.length);

          const _delayInMs =
            typeof delayInMs === 'number'
              ? delayInMs
              : (delayInMs?.(buffer) ?? 10);

          await delay(_delayInMs);
        }
      },
    });
  };
}

const CHUNKING_REGEXPS = {
  line: /\n+/m,
  list: /.{8}/m,
  word: /\S+\s+/m,
};

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    apiKey?: string;
    messages: any[];
    system?: string;
    provider?: 'openai' | 'pollinations';
    action?: 'text' | 'image';
    imageOptions?: {
      width?: number;
      height?: number;
      model?: string;
      seed?: number;
    };
  };

  const {
    apiKey: key,
    messages,
    system,
    provider: providerParam = 'pollinations',
    action = 'text',
    imageOptions = {}
  } = body;

  // Make provider mutable for fallback scenarios
  let provider = providerParam;

  // Handle image generation requests
  if (action === 'image') {
    const pollinations = new PollinationsAI();

    // Extract image prompt from the last message
    const lastMessage = messages[messages.length - 1];
    const imagePrompt = lastMessage?.content || '';

    if (!imagePrompt) {
      return NextResponse.json(
        { error: 'Image prompt is required' },
        { status: 400 }
      );
    }

    try {
      const imageResult = await pollinations.generateImage(imagePrompt, imageOptions);

      return NextResponse.json({
        type: 'image',
        data: imageResult,
        message: `Generated image for: "${imagePrompt}"`
      });
    } catch (error) {
      console.error('Image generation error:', error);
      return NextResponse.json(
        { error: 'Failed to generate image' },
        { status: 500 }
      );
    }
  }

  // Handle text generation with Pollinations.AI
  if (provider === 'pollinations') {
    const pollinations = new PollinationsAI();

    // Extract the last user message
    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage?.content || '';

    if (!userPrompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    try {
      // Use simple GET request for basic text generation
      const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(userPrompt)}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        }
      });

      if (!response.ok) {
        throw new Error(`Pollinations API error: ${response.status}`);
      }

      const text = await response.text();

      // Create a streaming response similar to OpenAI format
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Split text into chunks for streaming effect
          const words = text.split(' ');
          let index = 0;

          const sendChunk = () => {
            if (index < words.length) {
              const chunk = words[index] + (index < words.length - 1 ? ' ' : '');
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                choices: [{
                  delta: { content: chunk }
                }]
              })}\n\n`));
              index++;
              setTimeout(sendChunk, 50); // Delay between words
            } else {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            }
          };

          sendChunk();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } catch (error) {
      console.error('Pollinations.AI error:', error);
      // Fallback to OpenAI if Pollinations fails
      // Re-declare provider as mutable
      const mutableProvider: any = 'openai';
      provider = mutableProvider;
    }
  }

  // Handle OpenAI requests (original logic)
  const apiKey = key || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OpenAI API key.' },
      { status: 401 }
    );
  }

  const openai = createOpenAI({ apiKey });

  let isInCodeBlock = false;
  let isInTable = false;
  let isInList = false;
  let isInLink = false;

  try {
    const result = streamText({
      experimental_transform: smoothStream({
        chunking: (buffer) => {
          // Check for code block markers
          if (/```[^\s]+/.test(buffer)) {
            isInCodeBlock = true;
          } else if (isInCodeBlock && buffer.includes('```')) {
            isInCodeBlock = false;
          }
          // test case: should not deserialize link with markdown syntax
          if (buffer.includes('http')) {
            isInLink = true;
          } else if (buffer.includes('https')) {
            isInLink = true;
          } else if (buffer.includes('\n') && isInLink) {
            isInLink = false;
          }
          if (buffer.includes('*') || buffer.includes('-')) {
            isInList = true;
          } else if (buffer.includes('\n') && isInList) {
            isInList = false;
          }
          // Simple table detection: enter on |, exit on double newline
          if (!isInTable && buffer.includes('|')) {
            isInTable = true;
          } else if (isInTable && buffer.includes('\n\n')) {
            isInTable = false;
          }

          // Use line chunking for code blocks and tables, word chunking otherwise
          // Choose the appropriate chunking strategy based on content type
          let match;

          if (isInCodeBlock || isInTable || isInLink) {
            // Use line chunking for code blocks and tables
            match = CHUNKING_REGEXPS.line.exec(buffer);
          } else if (isInList) {
            // Use list chunking for lists
            match = CHUNKING_REGEXPS.list.exec(buffer);
          } else {
            // Use word chunking for regular text
            match = CHUNKING_REGEXPS.word.exec(buffer);
          }
          if (!match) {
            return null;
          }

          return buffer.slice(0, match.index) + match?.[0];
        },
        delayInMs: () => (isInCodeBlock || isInTable ? 100 : 30),
      }),
      maxTokens: 2048,
      messages: convertToCoreMessages(messages),
      model: openai('gpt-4o'),
      system: system,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('OpenAI error:', error);
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

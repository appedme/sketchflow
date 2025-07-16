import type { NextRequest } from 'next/server';

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

// Pollinations.AI API client for copilot
class PollinationsAI {
  private baseUrl = 'https://text.pollinations.ai';

  async generateText(prompt: string, options: {
    model?: string;
    system?: string;
    maxTokens?: number;
    temperature?: number;
  } = {}) {
    const { model = 'openai', system, maxTokens = 50, temperature = 0.7 } = options;

    // Combine system and user prompt for better context
    const fullPrompt = system ? `${system}\n\nUser: ${prompt}` : prompt;

    try {
      // Use simple GET request for quick copilot responses
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(fullPrompt)}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain',
        }
      });

      if (!response.ok) {
        throw new Error(`Pollinations API error: ${response.status}`);
      }

      const text = await response.text();

      // Truncate to maxTokens (approximate)
      const words = text.split(' ');
      const truncatedText = words.slice(0, Math.min(words.length, maxTokens)).join(' ');

      return {
        text: truncatedText,
        finishReason: 'stop',
        usage: {
          promptTokens: prompt.length / 4, // Rough estimate
          completionTokens: truncatedText.length / 4,
          totalTokens: (prompt.length + truncatedText.length) / 4
        }
      };
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
    const { width = 512, height = 512, model = 'flux', seed } = options;

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

  async generateAudio(prompt: string, options: {
    voice?: string;
    model?: string;
  } = {}) {
    const { voice = 'alloy', model = 'openai-audio' } = options;

    const audioUrl = `${this.baseUrl}/${encodeURIComponent(prompt)}?model=${model}&voice=${voice}`;

    return {
      url: audioUrl,
      prompt,
      voice,
      model
    };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    apiKey?: string;
    model?: string;
    prompt: string;
    system?: string;
    provider?: 'openai' | 'pollinations';
    action?: 'text' | 'image' | 'audio';
    imageOptions?: {
      width?: number;
      height?: number;
      model?: string;
      seed?: number;
    };
    audioOptions?: {
      voice?: string;
      model?: string;
    };
  };

  const {
    apiKey: key,
    model = 'gpt-4o-mini',
    prompt,
    system,
    provider = 'pollinations',
    action = 'text',
    imageOptions = {},
    audioOptions = {}
  } = body;

  // Handle Pollinations.AI requests
  if (provider === 'pollinations') {
    const pollinations = new PollinationsAI();

    try {
      switch (action) {
        case 'image':
          const imageResult = await pollinations.generateImage(prompt, imageOptions);
          return NextResponse.json({
            type: 'image',
            data: imageResult,
            text: `Generated image: ${imageResult.url}`,
            finishReason: 'stop',
            usage: {
              promptTokens: prompt.length / 4,
              completionTokens: 0,
              totalTokens: prompt.length / 4
            }
          });

        case 'audio':
          const audioResult = await pollinations.generateAudio(prompt, audioOptions);
          return NextResponse.json({
            type: 'audio',
            data: audioResult,
            text: `Generated audio: ${audioResult.url}`,
            finishReason: 'stop',
            usage: {
              promptTokens: prompt.length / 4,
              completionTokens: 0,
              totalTokens: prompt.length / 4
            }
          });

        case 'text':
        default:
          const textResult = await pollinations.generateText(prompt, {
            system,
            maxTokens: 50,
            temperature: 0.7
          });
          return NextResponse.json(textResult);
      }
    } catch (error) {
      console.error('Pollinations.AI error:', error);
      // Fallback to OpenAI if Pollinations fails
      // Continue to OpenAI logic below
    }
  }

  // Handle OpenAI requests (original logic + fallback)
  const apiKey = key || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing OpenAI API key and Pollinations.AI failed.' },
      { status: 401 }
    );
  }

  const openai = createOpenAI({ apiKey });

  try {
    const result = await generateText({
      abortSignal: req.signal,
      maxTokens: 50,
      model: openai(model),
      prompt: prompt,
      system,
      temperature: 0.7,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(null, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

// Comprehensive Pollinations.AI test endpoint
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'text';
    const prompt = searchParams.get('prompt') || 'Hello, world!';

    try {
        switch (action) {
            case 'text':
                // Test text generation
                const textResponse = await fetch(`https://text.pollinations.ai/${encodeURIComponent(prompt)}`, {
                    method: 'GET',
                    headers: { 'Accept': 'text/plain' }
                });

                if (!textResponse.ok) {
                    throw new Error(`Text API error: ${textResponse.status}`);
                }

                const text = await textResponse.text();
                return NextResponse.json({
                    type: 'text',
                    prompt,
                    result: text,
                    timestamp: new Date().toISOString()
                });

            case 'image':
                // Test image generation
                const width = parseInt(searchParams.get('width') || '512');
                const height = parseInt(searchParams.get('height') || '512');
                const model = searchParams.get('model') || 'flux';

                const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=${model}`;

                return NextResponse.json({
                    type: 'image',
                    prompt,
                    result: {
                        url: imageUrl,
                        width,
                        height,
                        model
                    },
                    timestamp: new Date().toISOString()
                });

            case 'audio':
                // Test audio generation
                const voice = searchParams.get('voice') || 'alloy';
                const audioModel = searchParams.get('model') || 'openai-audio';

                const audioUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${audioModel}&voice=${voice}`;

                return NextResponse.json({
                    type: 'audio',
                    prompt,
                    result: {
                        url: audioUrl,
                        voice,
                        model: audioModel
                    },
                    timestamp: new Date().toISOString()
                });

            case 'models':
                // Test models endpoint
                const modelsResponse = await fetch('https://text.pollinations.ai/models');
                const models = await modelsResponse.json();

                return NextResponse.json({
                    type: 'models',
                    result: models,
                    timestamp: new Date().toISOString()
                });

            case 'image-models':
                // Test image models endpoint
                const imageModelsResponse = await fetch('https://image.pollinations.ai/models');
                const imageModels = await imageModelsResponse.json();

                return NextResponse.json({
                    type: 'image-models',
                    result: imageModels,
                    timestamp: new Date().toISOString()
                });

            case 'feed':
                // Test real-time feeds
                const feedType = searchParams.get('feedType') || 'text';
                const feedUrl = feedType === 'image'
                    ? 'https://image.pollinations.ai/feed'
                    : 'https://text.pollinations.ai/feed';

                const feedResponse = await fetch(feedUrl);
                const feed = await feedResponse.json();

                return NextResponse.json({
                    type: 'feed',
                    feedType,
                    result: feed,
                    timestamp: new Date().toISOString()
                });

            default:
                return NextResponse.json({
                    error: 'Invalid action',
                    availableActions: ['text', 'image', 'audio', 'models', 'image-models', 'feed'],
                    examples: {
                        text: '/api/ai/pollinations-test?action=text&prompt=Write a haiku about coding',
                        image: '/api/ai/pollinations-test?action=image&prompt=A beautiful sunset&width=1024&height=768',
                        audio: '/api/ai/pollinations-test?action=audio&prompt=Hello world&voice=alloy',
                        models: '/api/ai/pollinations-test?action=models',
                        imageModels: '/api/ai/pollinations-test?action=image-models',
                        feed: '/api/ai/pollinations-test?action=feed&feedType=text'
                    }
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Pollinations.AI test error:', error);
        return NextResponse.json({
            error: 'Test failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            action,
            prompt,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const body = await req.json() as {
        action?: string;
        prompt: string;
        options?: any;
    };
    const { action = 'text', prompt, options = {} } = body;

    try {
        switch (action) {
            case 'openai-compatible':
                // Test OpenAI compatible endpoint
                const openaiResponse = await fetch('https://text.pollinations.ai/openai', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: options.model || 'openai',
                        messages: [
                            { role: 'user', content: prompt }
                        ],
                        max_tokens: options.maxTokens || 100,
                        temperature: options.temperature || 0.7
                    })
                });

                if (!openaiResponse.ok) {
                    throw new Error(`OpenAI compatible API error: ${openaiResponse.status}`);
                }

                const openaiResult = await openaiResponse.json();

                return NextResponse.json({
                    type: 'openai-compatible',
                    prompt,
                    result: openaiResult,
                    timestamp: new Date().toISOString()
                });

            default:
                return NextResponse.json({
                    error: 'Invalid POST action',
                    availableActions: ['openai-compatible'],
                    example: {
                        action: 'openai-compatible',
                        prompt: 'Explain quantum computing in simple terms',
                        options: {
                            model: 'openai',
                            maxTokens: 150,
                            temperature: 0.7
                        }
                    }
                }, { status: 400 });
        }
    } catch (error) {
        console.error('Pollinations.AI POST test error:', error);
        return NextResponse.json({
            error: 'POST test failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            action,
            prompt,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
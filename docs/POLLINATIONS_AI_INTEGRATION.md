# Pollinations.AI Integration Documentation

## Overview

We've successfully integrated Pollinations.AI into the SketchFlow document editor, providing free and open-source AI capabilities for text generation, image creation, and audio synthesis. This integration works alongside OpenAI as a fallback option.

## Features Implemented

### 🎯 **Text Generation**
- **Free AI Text Generation**: Using Pollinations.AI's text API
- **Streaming Responses**: Real-time text streaming for better UX
- **Fallback to OpenAI**: Automatic fallback if Pollinations.AI fails
- **System Prompts**: Support for context and instructions

### 🎨 **Image Generation**
- **Free Image Creation**: Generate images from text prompts
- **Multiple Models**: Support for different image models (flux, etc.)
- **Customizable Dimensions**: Width and height control
- **Seed Support**: Reproducible image generation

### 🎵 **Audio Generation**
- **Text-to-Speech**: Convert text to audio
- **Voice Selection**: Multiple voice options
- **OpenAI Audio Model**: High-quality audio synthesis

## API Endpoints

### 1. Enhanced Command Route (`/api/ai/command`)

**Text Generation:**
```javascript
POST /api/ai/command
{
  "messages": [{"role": "user", "content": "Write a haiku about coding"}],
  "provider": "pollinations",
  "action": "text",
  "system": "You are a helpful coding assistant"
}
```

**Image Generation:**
```javascript
POST /api/ai/command
{
  "messages": [{"role": "user", "content": "A beautiful sunset over mountains"}],
  "provider": "pollinations",
  "action": "image",
  "imageOptions": {
    "width": 1024,
    "height": 768,
    "model": "flux",
    "seed": 12345
  }
}
```

### 2. Enhanced Copilot Route (`/api/ai/copilot`)

**Quick Text Completion:**
```javascript
POST /api/ai/copilot
{
  "prompt": "Complete this function: function fibonacci(",
  "provider": "pollinations",
  "action": "text",
  "system": "You are a coding assistant"
}
```

**Image Generation:**
```javascript
POST /api/ai/copilot
{
  "prompt": "A diagram showing React component lifecycle",
  "provider": "pollinations",
  "action": "image",
  "imageOptions": {
    "width": 800,
    "height": 600,
    "model": "flux"
  }
}
```

**Audio Generation:**
```javascript
POST /api/ai/copilot
{
  "prompt": "Hello, welcome to SketchFlow!",
  "provider": "pollinations",
  "action": "audio",
  "audioOptions": {
    "voice": "alloy",
    "model": "openai-audio"
  }
}
```

### 3. Test Endpoint (`/api/ai/pollinations-test`)

**Test Text Generation:**
```
GET /api/ai/pollinations-test?action=text&prompt=Hello world
```

**Test Image Generation:**
```
GET /api/ai/pollinations-test?action=image&prompt=A cat&width=512&height=512
```

**Test Audio Generation:**
```
GET /api/ai/pollinations-test?action=audio&prompt=Hello&voice=alloy
```

**List Available Models:**
```
GET /api/ai/pollinations-test?action=models
GET /api/ai/pollinations-test?action=image-models
```

**Real-time Feeds:**
```
GET /api/ai/pollinations-test?action=feed&feedType=text
GET /api/ai/pollinations-test?action=feed&feedType=image
```

## Pollinations.AI API Reference

### Text Generation
- **Simple GET**: `GET https://text.pollinations.ai/{prompt}`
- **OpenAI Compatible**: `POST https://text.pollinations.ai/openai`
- **Models**: `GET https://text.pollinations.ai/models`
- **Feed**: `GET https://text.pollinations.ai/feed`

### Image Generation
- **Generate**: `GET https://image.pollinations.ai/prompt/{prompt}`
- **With Options**: `GET https://image.pollinations.ai/prompt/{prompt}?width=1024&height=768&model=flux`
- **Models**: `GET https://image.pollinations.ai/models`
- **Feed**: `GET https://image.pollinations.ai/feed`

### Audio Generation
- **Generate**: `GET https://text.pollinations.ai/{prompt}?model=openai-audio&voice={voice}`

## Implementation Details

### PollinationsAI Class

```typescript
class PollinationsAI {
  private baseUrl = 'https://text.pollinations.ai';

  async generateText(prompt: string, options: {
    model?: string;
    system?: string;
    maxTokens?: number;
    temperature?: number;
  }) {
    // Implementation for text generation
  }

  async generateImage(prompt: string, options: {
    width?: number;
    height?: number;
    model?: string;
    seed?: number;
  }) {
    // Implementation for image generation
  }

  async generateAudio(prompt: string, options: {
    voice?: string;
    model?: string;
  }) {
    // Implementation for audio generation
  }
}
```

### Provider Selection

Both routes support provider selection:
- `"provider": "pollinations"` - Use Pollinations.AI (default)
- `"provider": "openai"` - Use OpenAI
- Automatic fallback to OpenAI if Pollinations.AI fails

### Action Types

- `"action": "text"` - Text generation (default)
- `"action": "image"` - Image generation
- `"action": "audio"` - Audio generation (copilot only)

## Usage in Document Editor

### Text Generation
The document editor can now use free AI text generation:
```javascript
// In the document editor
const response = await fetch('/api/ai/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: userPrompt }],
    provider: 'pollinations',
    action: 'text',
    system: 'You are a helpful writing assistant'
  })
});
```

### Image Generation
Generate images directly in documents:
```javascript
// Generate an image for the document
const response = await fetch('/api/ai/command', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'A diagram of the solar system' }],
    provider: 'pollinations',
    action: 'image',
    imageOptions: {
      width: 1024,
      height: 768,
      model: 'flux'
    }
  })
});

const result = await response.json();
// result.data.url contains the image URL
```

## Benefits

### 🆓 **Cost Effective**
- **Free API**: No API keys or costs required
- **Open Source**: Transparent and community-driven
- **No Rate Limits**: Generous usage limits

### 🚀 **Performance**
- **Fast Response**: Quick generation times
- **Streaming Support**: Real-time text streaming
- **Multiple Models**: Choose the best model for your needs

### 🔧 **Flexibility**
- **Multiple Formats**: Text, images, and audio
- **Customizable**: Width, height, voice, model selection
- **Fallback Support**: Automatic OpenAI fallback

### 🛡️ **Reliability**
- **Error Handling**: Comprehensive error handling
- **Fallback System**: OpenAI as backup
- **Type Safety**: Full TypeScript support

## Testing

### Manual Testing
Use the test endpoint to verify functionality:

1. **Test Text Generation:**
   ```bash
   curl "http://localhost:3000/api/ai/pollinations-test?action=text&prompt=Write a haiku"
   ```

2. **Test Image Generation:**
   ```bash
   curl "http://localhost:3000/api/ai/pollinations-test?action=image&prompt=A sunset"
   ```

3. **Test Models:**
   ```bash
   curl "http://localhost:3000/api/ai/pollinations-test?action=models"
   ```

### Integration Testing
Test the enhanced AI routes in your document editor:

1. Open a document in SketchFlow
2. Use AI commands with Pollinations.AI
3. Generate images and text
4. Verify fallback to OpenAI works

## Configuration

### Environment Variables
```env
# Optional - for OpenAI fallback
OPENAI_API_KEY=your_openai_key_here

# Pollinations.AI requires no API key!
```

### Default Settings
```typescript
const defaultSettings = {
  provider: 'pollinations',
  textModel: 'openai',
  imageModel: 'flux',
  audioVoice: 'alloy',
  maxTokens: 2048,
  temperature: 0.7,
  imageWidth: 1024,
  imageHeight: 1024
};
```

## Troubleshooting

### Common Issues

1. **Pollinations.AI Timeout:**
   - Automatic fallback to OpenAI
   - Check network connectivity
   - Verify prompt format

2. **Image Generation Fails:**
   - Check prompt content
   - Verify image dimensions
   - Try different models

3. **Audio Generation Issues:**
   - Verify voice parameter
   - Check prompt length
   - Ensure model compatibility

### Error Responses
```json
{
  "error": "Failed to generate content",
  "message": "Specific error details",
  "provider": "pollinations",
  "action": "text",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Future Enhancements

### Planned Features
- **Model Selection UI**: User interface for model selection
- **Image Editing**: Built-in image editing capabilities
- **Audio Playback**: Direct audio playback in documents
- **Batch Generation**: Multiple content generation
- **Custom Models**: Support for custom Pollinations.AI models

### Integration Opportunities
- **Canvas Integration**: Generate images directly in canvas
- **Voice Notes**: Audio generation for document narration
- **Template Generation**: AI-powered document templates
- **Collaborative AI**: Multi-user AI assistance

## Conclusion

The Pollinations.AI integration provides SketchFlow with powerful, free AI capabilities that enhance the document editing experience. With support for text, image, and audio generation, users can create rich, multimedia documents without incurring API costs.

The implementation includes robust error handling, fallback mechanisms, and comprehensive testing tools to ensure reliability and performance.
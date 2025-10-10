# Apiframe SDK - Quick Start Guide

Get started with the Apiframe Node.js SDK in 5 minutes!

## Step 1: Installation

```bash
npm install @apiframe-ai/sdk
```

## Step 2: Get Your API Key

1. Sign up at [apiframe.ai](https://apiframe.ai)
2. Navigate to your dashboard
3. Copy your API key

## Step 3: Create Your First Image

Create a file called `app.js`:

```javascript
const { Apiframe } = require('@apiframe-ai/sdk');

// Initialize with your API key
const client = new Apiframe({
  apiKey: 'YOUR_API_KEY_HERE'
});

async function main() {
  try {
    // Generate an image
    console.log('Creating image...');
    const task = await client.midjourney.imagine({
      prompt: 'a beautiful sunset over mountains',
      aspectRatio: '16:9'
    });
    
    console.log('Task ID:', task.id);
    
    // Wait for completion
    const result = await client.tasks.waitFor(task.id, {
      onProgress: (p) => console.log(`Progress: ${p}%`)
    });
    
    console.log('✅ Done!');
    console.log('Image URLs:', result.image_urls); // imagine returns 4 images
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
```

## Step 4: Run Your Code

```bash
node app.js
```

## What's Next?

### Try Different Services

#### Flux AI (Fast Image Generation)
```javascript
const task = await client.flux.generate({
  prompt: 'a futuristic city',
  width: 1024,
  height: 1024
});
```

#### Luma AI (Video Generation)
```javascript
const task = await client.luma.generate({
  prompt: 'waves crashing on a beach',
  aspectRatio: '16:9'
});
```

#### Suno AI (Music Generation)
```javascript
const task = await client.suno.generate({
  prompt: 'an upbeat electronic track'
});
```

### Advanced Features

#### Upload and Use Your Own Images
```javascript
// Upload an image
const upload = await client.media.upload({
  file: './my-image.jpg'
});

// Use it in generation
const task = await client.midjourney.blend({
  images: [upload.url, 'https://another-image.jpg']
});
```

#### Progress Tracking
```javascript
const result = await client.tasks.waitFor(taskId, {
  onProgress: (progress) => {
    console.log(`Progress: ${progress}%`);
  },
  interval: 2000,  // Check every 2 seconds
  timeout: 600000  // 10 minute timeout
});
```

#### Error Handling
```javascript
const { 
  ApiframeError, 
  AuthenticationError, 
  RateLimitError 
} = require('@apiframe-ai/sdk');

try {
  const task = await client.midjourney.imagine({ prompt: '...' });
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key!');
  } else if (error instanceof RateLimitError) {
    console.error('Too many requests. Please slow down.');
  } else {
    console.error('Error:', error.message);
  }
}
```

## TypeScript Support

The SDK has full TypeScript support:

```typescript
import Apiframe, { MidjourneyImagineParams } from '@apiframe-ai/sdk';

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY!
});

const params: MidjourneyImagineParams = {
  prompt: 'a beautiful landscape',
  aspectRatio: '16:9',
  model: 'v7'
};

const task = await client.midjourney.imagine(params);
```

## Environment Variables

For security, use environment variables:

```bash
# .env file
APIFRAME_API_KEY=your_api_key_here
```

```javascript
require('dotenv').config();

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY
});
```

## Common Patterns

### Generate and Download
```javascript
async function generateAndDownload(prompt) {
  const task = await client.midjourney.imagine({ prompt });
  const result = await client.tasks.waitFor(task.id);
  
  // Download the first image
  const response = await fetch(result.image_urls[0]);
  const buffer = await response.buffer();
  require('fs').writeFileSync('output.png', buffer);
  
  console.log('Image saved to output.png');
}
```

### Batch Processing
```javascript
async function generateMultiple(prompts) {
  // Create all tasks
  const tasks = await Promise.all(
    prompts.map(prompt => 
      client.midjourney.imagine({ prompt })
    )
  );
  
  // Wait for all to complete
  const results = await Promise.all(
    tasks.map(task => 
      client.tasks.waitFor(task.id)
    )
  );
  
  return results;
}

const images = await generateMultiple([
  'a sunset',
  'a mountain',
  'a beach'
]);
```

### Retry Logic
```javascript
async function generateWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const task = await client.midjourney.imagine(params);
      return await client.tasks.waitFor(task.id);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Attempt ${i + 1} failed, retrying...`);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}
```

## Best Practices

1. **Use Environment Variables** for API keys
2. **Handle Errors** appropriately
3. **Set Reasonable Timeouts** for long-running tasks
4. **Monitor Progress** with callbacks
5. **Rate Limit** your requests
6. **Cache Results** when possible

## Need Help?

- 📖 [Full Documentation](README.md)
- 🌐 [API Docs](https://docs.apiframe.ai)
- 💬 [GitHub Issues](https://github.com/apiframe/apiframe-nodejs-sdk/issues)

## Examples

Check out complete examples in the `/examples` directory:
- Midjourney image generation
- Flux AI image generation
- Luma video generation
- Suno music generation
- Media upload and usage

Happy coding! 🚀


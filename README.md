# Apiframe Node.js SDK

Official Node.js SDK for [Apiframe](https://apiframe.ai) - The ultimate platform for AI image and video generation APIs.

[![npm version](https://badge.fury.io/js/%40apiframe-ai%2Fsdk.svg)](https://www.npmjs.com/package/@apiframe-ai/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎨 **Midjourney API** (Original) - Generate, upscale, vary, blend, inpaint, face swap
- 🚀 **Midjourney Pro API** - Fast & Turbo modes, better stability
- ⚡ **Flux AI** - Fast and high-quality image generation
- 🎭 **Ideogram** - Creative image generation with text rendering
- 🎬 **Luma AI** - Text and image to video generation
- 🎵 **Suno AI** - AI music generation
- 🎶 **Udio AI** - Advanced music creation
- 🎥 **Runway ML** - Gen-3 video generation
- 🎪 **Kling AI** - Video generation and manipulation
- 📸 **AI Photos** - Headshots, face swap, and photo enhancement
- 📤 **Media Upload** - Upload and manage media files

## Installation

```bash
npm install @apiframe-ai/sdk
```

## Quick Start

```javascript
const { Apiframe } = require('@apiframe-ai/sdk');

const client = new Apiframe({
  apiKey: 'your_api_key_here'
});

async function generateImage() {
  // Create an image generation task
  const task = await client.midjourney.imagine({
    prompt: 'a serene mountain landscape at sunset, photorealistic',
    aspect_ratio: '16:9'
  });

  console.log('Task created:', task.id);

  // Wait for completion with progress updates
  const result = await client.tasks.waitFor(task.id, {
    onProgress: (p) => console.log('Progress:', p)
  });

  console.log('Images ready:', result.image_urls); // imagine returns 4 images
}

generateImage();
```

## TypeScript Support

The SDK is written in TypeScript and includes type definitions:

```typescript
import { Apiframe, MidjourneyImagineParams, TaskResponse } from '@apiframe-ai/sdk';

const client = new Apiframe({
  apiKey: 'your_api_key_here'
});

const params: MidjourneyImagineParams = {
  prompt: 'a beautiful sunset',
  aspect_ratio: '16:9'
};

const task: TaskResponse = await client.midjourney.imagine(params);
```

## API Reference

### Configuration

```javascript
const client = new Apiframe({
  apiKey: 'your_api_key',      // Required: Your Apiframe API key
  baseURL: 'https://api.apiframe.ai', // Optional: Custom API endpoint
  timeout: 30000                // Optional: Request timeout in ms (default: 30000)
});
```

### Midjourney (Original API)

The original Midjourney API with comprehensive features.
**Endpoint:** `/imagine`, `/imagine-video`, `/reroll`, `/variations`, `/faceswap`, etc.
**Docs:** [https://docs.apiframe.ai/api-endpoints](https://docs.apiframe.ai/api-endpoints)

#### imagine(params)
Create a new image generation task.

```javascript
const task = await client.midjourney.imagine({
  prompt: 'a serene mountain landscape',
  aspect_ratio: '16:9',  // Optional: '1:1', '16:9', '9:16', etc.
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### imagineVideo(params)
Generate videos using a text prompt and an image URL.

```javascript
const task = await client.midjourney.imagineVideo({
  prompt: 'cinematic mountain landscape',
  image_url: 'https://example.com/start-frame.jpg',
  motion: 'high',  // Optional: 'low' or 'high' (default: low by default)
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### reroll(params)
Reroll to create new images from a previous Imagine task.

```javascript
const task = await client.midjourney.reroll({
  parent_task_id: 'original_task_id',
  prompt: 'optional new prompt',  // Optional: uses original prompt if not provided
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### variations(params)
Create 4 new variations of one of the 4 generated images.

```javascript
const task = await client.midjourney.variations({
  parent_task_id: 'original_task_id',
  index: '1',  // '1', '2', '3', '4', or 'strong', 'subtle'
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### faceSwap(params)
Swap the face on a target image with the face on a provided image.

```javascript
const task = await client.midjourney.faceSwap({
  target_image_url: 'https://example.com/target.jpg',
  swap_image_url: 'https://example.com/face.jpg',
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### upscale1x(params)
Upscale one of the 4 generated images by the Imagine endpoint to get a single image.

```javascript
const task = await client.midjourney.upscale1x({
  parent_task_id: 'original_task_id',
  index: '1',  // '1', '2', '3', or '4'
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### upscaleAlt(params)
Upscale with Subtle or Creative mode. Subtle doubles the size keeping details similar to original, Creative adds details to the image. You need to first upscale using `upscale1x`.

```javascript
const task = await client.midjourney.upscaleAlt({
  parent_task_id: 'upscale1x_task_id',
  type: 'subtle',  // 'subtle' or 'creative'
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### upscaleHighres(params)
Upscale any image to higher resolution (2x or 4x) - not from Midjourney. Image must not be larger than 2048×2048.

```javascript
const task = await client.midjourney.upscaleHighres({
  parent_task_id: 'task_id',  // Or use image_url instead
  image_url: 'https://example.com/image.jpg',  // Or use parent_task_id instead
  type: '2x',  // '2x' or '4x'
  index: '1',  // Optional: '1', '2', '3', or '4' - only if it's a 4 generated images task
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### inpaint(params)
Redraw a selected area of an image (Vary Region). You first need to upscale using `upscale1x`.

```javascript
const task = await client.midjourney.inpaint({
  parent_task_id: 'upscale1x_task_id',
  mask: 'base64_encoded_mask_image',  // Base64 encoding of the selected area
  prompt: 'a red sports car',
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### outpaint(params)
Enlarges an image's canvas beyond its original size while keeping the contents unchanged. You first need to upscale using `upscale1x`.

```javascript
const task = await client.midjourney.outpaint({
  parent_task_id: 'upscale1x_task_id',
  zoom_ratio: 1.5,  // Can be 1.5, 2, or 1 for custom zoom
  aspect_ratio: '1:1',  // Optional
  prompt: 'mountain landscape',  // Optional: drawing prompt for new areas
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### pan(params)
Broadens the image canvas in a specific direction, keeping the original content intact. You first need to upscale using `upscale1x`.

```javascript
const task = await client.midjourney.pan({
  parent_task_id: 'upscale1x_task_id',
  direction: 'up',  // 'up', 'down', 'left', or 'right'
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### describe(params)
Writes four example prompts based on an image you upload.

```javascript
const task = await client.midjourney.describe({
  image_url: 'https://example.com/image.jpg',
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### blend(params)
Blend multiple images into one image (2-5 images).

```javascript
const task = await client.midjourney.blend({
  image_urls: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg'
  ],
  dimension: 'square',  // Optional: 'square', 'portrait', or 'landscape' (default: square)
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### shorten(params)
Analyzes your prompt and suggests optimizations by focusing on essential terms.

```javascript
const task = await client.midjourney.shorten({
  prompt: 'a very beautiful and amazing sunset over the mountains with clouds',
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### seed(params)
Get the seed of a generated image.

```javascript
const task = await client.midjourney.seed({
  task_id: 'original_task_id',
  webhook_url: 'https://your-domain.com/webhook',    // Optional
  webhook_secret: 'your-secret'                       // Optional
});
```

#### Other Original Midjourney Methods
- `upscale(params)` - Upscale a specific image (legacy method)
- `vary(params)` - Create variations of a specific image (legacy method)
- `zoom(params)` - Zoom out from an image (legacy method, use `outpaint` instead)

**Note:** For task management (fetch, fetchMany) and account info, use the `client.tasks` methods instead (see Tasks section below).

### Midjourney Pro API (MidjourneyAlt)

The Pro Midjourney API with Fast & Turbo modes for better performance.
**Endpoint:** `/pro/midjourney/*`
**Docs:** [https://docs.apiframe.ai/pro-midjourney-api/api-endpoints](https://docs.apiframe.ai/pro-midjourney-api/api-endpoints)

#### imagine(params)
Create a new image with Pro API (supports Fast and Turbo modes).

```javascript
const task = await client.midjourneyAlt.imagine({
  prompt: 'a serene mountain landscape',
  mode: 'turbo'    // 'fast' or 'turbo' (Pro exclusive)
});
```

#### upscale(params)
Upscale a specific image from a Pro API generation.

```javascript
const task = await client.midjourneyAlt.upscale({
  parent_task_id: 'parent_task_id',
  index: '1',       // '1', '2', '3', or '4'
  type: 'subtle'    // 'subtle' or 'creative'
});
```

#### vary(params)
Create variations with strong/subtle control.

```javascript
const task = await client.midjourneyAlt.vary({
  parent_task_id: 'parent_task_id',
  index: '1',          // '1', '2', '3', or '4'
  type: 'subtle'       // 'subtle' or 'strong'
});
```

#### variations(params)
Generate 4 variations of an image.

```javascript
const task = await client.midjourneyAlt.variations({
  parent_task_id: 'parent_task_id',
  index: '1'           // '1', '2', '3', or '4'
});
```

#### pan(params)
Pan in a specific direction.

```javascript
const task = await client.midjourneyAlt.pan({
  parent_task_id: 'parent_task_id',
  index: '1',          // '1', '2', '3', or '4'
  type: 'up'           // 'up', 'down', 'left', or 'right'
});
```

#### zoom(params)
Zoom out from an image.

```javascript
const task = await client.midjourneyAlt.zoom({
  parent_task_id: 'parent_task_id',
  index: '1',          // '1', '2', '3', or '4'
  type: '2'            // '1.5' (1.5x), '2' (2x), '{1, 2}' (custom), '1' (make square)
});
```

#### Other Pro API Methods
- `getGeneration(generationId)` - Get generation info
- `getAccountInfo()` - Get Pro API account info

**Key Differences:**
- ✨ Pro API uses `generationId` instead of `taskId`
- ⚡ Pro API supports `mode: 'fast' | 'turbo'` for speed control
- 🚀 Pro API has better stability and faster processing

### Flux

```javascript
// Generate with Flux (specify model)
const task = await client.flux.generate({
  model: 'flux-pro',  // 'flux-schnell', 'flux-pro', 'flux-dev', 'flux-pro-1.1', 'flux-pro-1.1-ultra'
  prompt: 'a futuristic cityscape',
  width: 1024,
  height: 1024,
  steps: 50,          // only for flux-pro and flux-dev
  guidance: 7.5,      // only for flux-pro and flux-dev
  seed: 42,
  safety_tolerance: 2
});

// Convenience methods (automatically set model)
const task = await client.flux.generatePro({
  prompt: 'a futuristic cityscape',
  width: 1024,
  height: 1024
});

const task = await client.flux.generateDev({
  prompt: 'a landscape',
  aspect_ratio: '16:9'
});

const task = await client.flux.generateSchnell({
  prompt: 'quick sketch',
  width: 512,
  height: 512
});

// Image-to-image with Flux Pro 1.1 Ultra
const task = await client.flux.generate({
  model: 'flux-pro-1.1-ultra',
  prompt: 'enhance this image',
  image_prompt: 'base64_encoded_image_here',
  image_prompt_strength: 0.8,
  raw: true
});
```

### Ideogram

```javascript
// Generate image
const task = await client.ideogram.generate({
  prompt: 'a logo design',
  aspect_ratio: 'ASPECT_1_1',
  style_type: 'DESIGN',
  magic_prompt_option: 'AUTO',
  seed: 12345,
  resolution: 'RESOLUTION_1024_1024'
});

// Upscale image
const task = await client.ideogram.upscale({
  image_url: 'https://...',
  prompt: 'enhance this image',
  resemblance: 80,  // 1-100
  detail: 50,       // 1-100
  seed: 12345
});

// Describe image
const task = await client.ideogram.describe({
  image_url: 'https://...'
});

// Remix (image-to-image)
const task = await client.ideogram.remix({
  image_url: 'https://...',
  prompt: 'transform this image...',
  image_weight: 70,  // 1-100
  style_type: 'REALISTIC'
});
```

### Luma AI (Video)

```javascript
// Generate video from text prompt
const task = await client.luma.generate({
  prompt: 'a serene beach with waves',
  aspect_ratio: '16:9',
  loop: false,
  enhance_prompt: true
});

// Generate video with start and end images
const task = await client.luma.generate({
  prompt: 'a smooth transition',
  image_url: 'https://start-image.jpg',
  end_image_url: 'https://end-image.jpg',
  aspect_ratio: '1:1'
});

// Extend a previously generated video
const task = await client.luma.extend({
  parent_task_id: 'previous_task_id',
  prompt: 'continue the scene with more action'
});
```

### Suno AI (Music)

```javascript
// Generate song with lyrics (creates TWO songs)
const task = await client.suno.generate({
  prompt: 'an upbeat electronic track',
  lyrics: 'Verse 1: Dancing through the night...',
  model: 'chirp-v3-5',
  tags: 'electronic, dance, upbeat',
  title: 'Digital Dreams',
  make_instrumental: false
});

// Result will contain TWO songs with same lyrics
// Use tasks.waitFor() or webhooks to get the result
const result = await client.tasks.waitFor(task.id);
// result.songs will contain array of 2 songs

// Upload audio and turn it into extendable song
const uploadTask = await client.suno.upload({
  audio_url: 'https://your-audio-url.mp3'
});
const uploadResult = await client.tasks.waitFor(uploadTask.id);
// uploadResult will contain song_id

// Extend a song
const extendTask = await client.suno.extend({
  song_id: uploadResult.song_id,
  continue_at: 30,
  from_upload: true,
  prompt: 'continue with more energy'
});

// Generate lyrics only
const lyricsTask = await client.suno.generateLyrics({
  prompt: 'a song about summer adventures'
});
const lyricsResult = await client.tasks.waitFor(lyricsTask.id);
// lyricsResult.lyrics will contain generated lyrics
```

### Udio AI (Music)

```javascript
// Generate music (creates TWO songs with lyrics)
const task = await client.udio.generate({
  prompt: 'a calm ambient soundtrack',
  lyrics: 'Verse 1: Under the stars...',
  model: 'udio32-v1.5',
  tags: 'ambient, calm, instrumental',
  prompt_strength: 0.8,
  clarity_strength: 0.7,
  lyrics_strength: 0.6,
  generation_quality: 0.9,
  lyrics_placement_start: 4,
  lyrics_placement_end: 20,
  bypass_prompt_optimization: false
});

// Result will contain TWO songs
// Use tasks.waitFor() or webhooks to get the final result
const result = await client.tasks.waitFor(task.id);
// result.songs will contain array of 2 songs with lyrics, audio_url, image_url
```

### Runway ML (Video)

```javascript
// Generate video (text2video, image2video, or video2video)
const task = await client.runway.generate({
  prompt: 'a drone shot flying over mountains',
  generation_type: 'text2video',
  model: 'gen3',
  aspect_ratio: '16:9',
  duration: 10,
  flip: false
});

// Convenience method: Text to video
const task = await client.runway.textToVideo(
  'a drone shot flying over mountains',
  { model: 'gen3a_turbo', duration: 5 }
);

// Convenience method: Image to video
const task = await client.runway.imageToVideo(
  'https://image-url.jpg',
  'add cinematic motion to this scene',
  { duration: 10 }
);

// Convenience method: Video to video
const task = await client.runway.videoToVideo(
  'https://video-url.mp4',
  'transform this video with a sunset atmosphere',
  { model: 'gen3', duration: 5 }
);
```

### Kling AI (Video)

```javascript
// Generate video (text2video or image2video)
const task = await client.kling.generate({
  prompt: 'a time-lapse of a flower blooming',
  generation_type: 'text2video',
  model: 'kling-v1-5',
  mode: 'pro',
  aspect_ratio: '16:9',
  duration: 10,
  cfg_scale: 0.5
});

// Convenience method: Text to video
const task = await client.kling.textToVideo(
  'a time-lapse of a flower blooming',
  { duration: 10, aspect_ratio: '16:9' }
);

// Convenience method: Image to video
const task = await client.kling.imageToVideo(
  'https://image-url.jpg',
  'animate this image with smooth motion',
  { mode: 'pro', duration: 5 }
);

// Virtual Try On
const task = await client.kling.tryon({
  human_image_url: 'https://person-image.jpg',
  cloth_image_url: 'https://clothing-image.jpg',
  model: 'kolors-virtual-try-on-v1-5'
});
```

### AI Photos

```javascript
// Step 1: Upload and prepare 10-30 images for training
const uploadTask = await client.aiPhotos.upload({
  images: ['base64_image_1', 'base64_image_2', '...'], // 10-30 images
  ethnicity: 'white',
  gender: 'male',
  age: 30
});

const uploadResult = await client.tasks.waitFor(uploadTask.id);
console.log('Images ready for training');

// Step 2: Train AI on the subject
const trainTask = await client.aiPhotos.train({
  training_images_id: uploadTask.id,
  trigger_word: 'TOKMSN' // Default trigger word
});

const trainResult = await client.tasks.waitFor(trainTask.id);
console.log('Training finished, trigger_word:', trainResult.trigger_word);

// Step 3: Generate photos using the trained model
const generateTask = await client.aiPhotos.generate({
  training_id: trainTask.id,
  prompt: 'a realistic portrait of TOKMSN black man wearing a suit',
  aspect_ratio: '1:1',
  number_of_images: '4',
  seed: 12345
});

const result = await client.tasks.waitFor(generateTask.id);
console.log('Generated photos:', result.image_urls);
```

### Media Upload

```javascript
// Upload image from file (max 2MB)
const upload = await client.media.upload({
  filename: './path/to/image.jpg'
});

console.log('Uploaded:', upload.imageURL);

// Upload audio from file (max 2MB, 60 seconds)
const audioUpload = await client.media.uploadAudio({
  filename: './path/to/audio.mp3'
});

console.log('Uploaded audio:', audioUpload.audioURL);

// Use uploaded media
const task = await client.midjourney.blend({
  image_urls: [upload.imageURL, another_url]
});
```

### Tasks

General task management endpoints.

#### get(taskId)
Get the result/status of a submitted task.

```javascript
const task = await client.tasks.get(taskId);
console.log(task.status); // 'pending', 'processing', 'completed', 'failed'
console.log(task); // The data depends on the type of the original request
```

#### getMany(taskIds)
Get the results/statuses of multiple tasks (min 2, max 20).

```javascript
const result = await client.tasks.getMany(['task_id_1', 'task_id_2', 'task_id_3']);
console.log(result.tasks); // Array of task results/statuses
```

#### waitFor(taskId, options)
Wait for a task to complete with progress tracking.

```javascript
const result = await client.tasks.waitFor(taskId, {
  onProgress: (progress) => {
    console.log(`Progress: ${progress}%`);
  },
  interval: 3000,    // Polling interval in ms (default: 3000)
  timeout: 300000    // Max wait time in ms (default: 300000 / 5 min)
});
```

#### getAccountInfo()
Get account details including credits, usage, plan, etc.

```javascript
const account = await client.tasks.getAccountInfo();
console.log(`Email: ${account.email}`);
console.log(`Credits: ${account.credits}`);
console.log(`Total Images: ${account.total_images}`);
console.log(`Plan: ${account.plan}`);
```

## Error Handling

```javascript
const { 
  ApiframeError, 
  AuthenticationError, 
  RateLimitError, 
  TimeoutError 
} = require('@apiframe-ai/sdk');

try {
  const task = await client.midjourney.imagine({ prompt: '...' });
  const result = await client.tasks.waitFor(task.id);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Invalid API key');
  } else if (error instanceof RateLimitError) {
    console.error('Rate limit exceeded');
  } else if (error instanceof TimeoutError) {
    console.error('Request timed out');
  } else if (error instanceof ApiframeError) {
    console.error('API error:', error.message);
    console.error('Status:', error.status);
  }
}
```

## Environment Variables

You can set your API key using an environment variable:

```bash
export APIFRAME_API_KEY=your_api_key_here
```

Then in your code:

```javascript
const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY
});
```

## Examples

Check the `/examples` directory for complete examples:

- `midjourney-example.js` - Midjourney Original API usage
- `midjourney-alt-example.js` - Midjourney Pro API usage
- `midjourney-comparison.js` - Compare both Midjourney APIs
- `flux-example.js` - Flux AI image generation
- `luma-video-example.js` - Luma video generation
- `suno-music-example.js` - Suno music generation
- `media-upload-example.js` - Media upload and usage
- `comprehensive-example.js` - All features demo

## Requirements

- Node.js >= 14.0.0
- An Apiframe API key (get one at [apiframe.ai](https://apiframe.ai))

## Documentation

For detailed API documentation, visit [docs.apiframe.ai](https://docs.apiframe.ai)

## Support

- Documentation: [docs.apiframe.ai](https://docs.apiframe.ai)
- GitHub Issues: [github.com/apiframe/apiframe-nodejs-sdk/issues](https://github.com/apiframe/apiframe-nodejs-sdk/issues)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


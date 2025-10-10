# Midjourney APIs Documentation

The Apiframe SDK supports **two distinct Midjourney APIs**, each with unique features and endpoints.

## Overview

| Feature | Original API (`midjourney`) | Pro API (`midjourneyAlt`) |
|---------|---------------------------|--------------------------|
| **Endpoint** | `/midjourney/*` | `/pro/midjourney/*` |
| **Documentation** | [docs.apiframe.ai/api-endpoints](https://docs.apiframe.ai/api-endpoints) | [docs.apiframe.ai/pro-midjourney-api](https://docs.apiframe.ai/pro-midjourney-api/api-endpoints) |
| **Speed Modes** | Standard | Fast & Turbo |
| **Seed Support** | ❌ | ❌ |
| **Reproducibility** | Limited | Limited |
| **Additional Features** | Blend, FaceSwap, Inpaint | Better stability |
| **Use Case** | Diverse features | Speed & consistency |

## Original Midjourney API

**Access:** `client.midjourney.*`

### Features

The Original API provides comprehensive image manipulation features:

#### Core Generation
- ✅ `imagine()` - Create images from prompts
- ✅ `upscale()` - Upscale specific images
- ✅ `vary()` - Create variations
- ✅ `zoom()` - Zoom out
- ✅ `pan()` - Pan in directions
- ✅ `reroll()` - Regenerate with same prompt

#### Advanced Features
- ✅ `blend()` - Blend multiple images
- ✅ `describe()` - Get prompts from images
- ✅ `inpaint()` - Edit specific regions (Vary Region)
- ✅ `faceSwap()` - Swap faces between images
- ✅ `shorten()` - Shorten prompts

#### Utilities
- ✅ `fetch()` - Get task status
- ✅ `fetchMany()` - Get multiple task statuses
- ✅ `getAccountInfo()` - Account information

### Example Usage

```javascript
const { Apiframe } = require('@apiframe-ai/sdk');
const client = new Apiframe({ apiKey: 'your_api_key' });

// Basic image generation
const task = await client.midjourney.imagine({
  prompt: 'a beautiful landscape',
  aspectRatio: '16:9',
  model: 'v7'
});

// Blend multiple images
const blendTask = await client.midjourney.blend({
  images: ['url1', 'url2'],
  aspectRatio: '16:9'
});

// Face swap
const swapTask = await client.midjourney.faceSwap({
  targetImage: 'target_url',
  faceImage: 'face_url'
});

// Inpaint (Vary Region)
const inpaintTask = await client.midjourney.inpaint({
  taskId: 'task_id',
  mask: 'mask_url',
  prompt: 'change this area'
});
```

## Pro Midjourney API (MidjourneyAlt)

**Access:** `client.midjourneyAlt.*`

### Features

The Pro API focuses on speed, stability, and reproducibility:

#### Core Generation (with modes)
- ✅ `imagine()` - Create images with Fast/Turbo modes
- ✅ `upscale()` - Upscale with mode selection
- ✅ `vary()` - Variations with subtle/strong strength
- ✅ `zoom()` - Zoom out with modes
- ✅ `pan()` - Pan with modes

#### Pro-Exclusive Features
- ⚡ **Fast Mode** - Faster generation
- 🚀 **Turbo Mode** - Ultra-fast generation
- 📊 **Better Stability** - More reliable

#### Utilities
- ✅ `getGeneration()` - Get generation info by ID
- ✅ `getAccountInfo()` - Pro API account info

### Example Usage

```javascript
const { Apiframe } = require('@apiframe-ai/sdk');
const client = new Apiframe({ apiKey: 'your_api_key' });

// Pro API with Turbo mode
const task = await client.midjourneyAlt.imagine({
  prompt: 'a beautiful landscape',
  mode: 'turbo'  // 'fast' or 'turbo'
});

// Upscale with subtle mode
const upscaleTask = await client.midjourneyAlt.upscale({
  parent_task_id: task.id,
  index: '1',
  type: 'subtle'
});

// Variations with strength control
const varyTask = await client.midjourneyAlt.vary({
  parent_task_id: task.id,
  index: '1',
  type: 'subtle'  // 'subtle' or 'strong'
});
```

## Key Differences

### 1. Parameter Names

| Original API | Pro API | Description |
|-------------|---------|-------------|
| `taskId` | `parent_task_id` | Task identifier |
| `index: number` | `index: string` | Image index |
| `strength: number` | `type: 'subtle'\|'strong'` | Variation strength |

### 2. Speed Modes (Pro API Only)

The Pro API offers two speed modes:

- **Fast Mode**: Balanced speed and quality
- **Turbo Mode**: Maximum speed

```javascript
// Fast mode
await client.midjourneyAlt.imagine({
  prompt: '...',
  mode: 'fast'
});

// Turbo mode (fastest)
await client.midjourneyAlt.imagine({
  prompt: '...',
  mode: 'turbo'
});
```

### 3. Feature Availability

**Original API Exclusive:**
- `blend()` - Blend multiple images
- `inpaint()` - Edit specific regions
- `faceSwap()` - Face swapping
- `describe()` - Get prompts from images
- `shorten()` - Shorten prompts
- `reroll()` - Regenerate

**Pro API Exclusive:**
- Speed modes (fast/turbo)
- Better stability
- Faster processing

## Which API Should I Use?

### Use Original API (`client.midjourney`) when:
- ✅ You need blend, faceSwap, or inpaint features
- ✅ You want diverse manipulation options
- ✅ You need describe or shorten functionality
- ✅ Standard generation speed is sufficient

### Use Pro API (`client.midjourneyAlt`) when:
- ✅ You need faster generation (Turbo mode)
- ✅ You prioritize stability
- ✅ You need consistent, predictable outputs

## Complete Examples

### Original API Complete Workflow

```javascript
// 1. Generate
const task = await client.midjourney.imagine({
  prompt: 'a serene landscape',
  aspectRatio: '16:9'
});

await client.tasks.waitFor(task.id);

// 2. Upscale
const upscale = await client.midjourney.upscale({
  taskId: task.id,
  index: 1
});

// 3. Create variations
const vary = await client.midjourney.vary({
  taskId: task.id,
  index: 1,
  strength: 0.5
});

// 4. Blend with another image
const blend = await client.midjourney.blend({
  images: [result.imageUrl, 'another_url'],
  aspectRatio: '1:1'
});
```

### Pro API Complete Workflow

```javascript
// 1. Generate with Turbo mode
const task = await client.midjourneyAlt.imagine({
  prompt: 'a serene landscape',
  mode: 'turbo'
});

await client.tasks.waitFor(task.id);

// 2. Upscale with subtle mode
const upscale = await client.midjourneyAlt.upscale({
  parent_task_id: task.id,
  index: '1',
  type: 'subtle'
});

// 3. Create subtle variations
const vary = await client.midjourneyAlt.vary({
  parent_task_id: task.id,
  index: '1',
  type: 'subtle'
});

// 4. Get generation info
const info = await client.midjourneyAlt.getGeneration(task.id);
```

## Migration Guide

### From Original to Pro API

If you're switching from Original to Pro API:

```javascript
// Before (Original API)
const task = await client.midjourney.imagine({
  prompt: '...',
  aspectRatio: '16:9'
});

await client.midjourney.upscale({
  taskId: task.id,
  index: 1
});

// After (Pro API)
const task = await client.midjourneyAlt.imagine({
  prompt: '...',
  mode: 'fast'      // NEW: Add mode
});

await client.midjourneyAlt.upscale({
  parent_task_id: task.id,  // CHANGED: taskId -> parent_task_id
  index: '1',               // CHANGED: number -> string
  type: 'subtle'            // NEW: upscale type
});
```

## TypeScript Support

Both APIs have full TypeScript support:

```typescript
import Apiframe, {
  MidjourneyImagineParams,
  MidjourneyAltImagineParams
} from '@apiframe-ai/sdk';

// Original API types
const params: MidjourneyImagineParams = {
  prompt: 'test',
  aspectRatio: '16:9'
};

// Pro API types
const proParams: MidjourneyAltImagineParams = {
  prompt: 'test',
  mode: 'turbo'
};
```

## Summary

Both Midjourney APIs are powerful and serve different use cases:

- **Original API**: Comprehensive features, more manipulation options
- **Pro API**: Speed and stability

You can use both in the same application - the SDK provides unified access to both!

---

For more information:
- Original API: [docs.apiframe.ai/api-endpoints](https://docs.apiframe.ai/api-endpoints)
- Pro API: [docs.apiframe.ai/pro-midjourney-api](https://docs.apiframe.ai/pro-midjourney-api/api-endpoints)


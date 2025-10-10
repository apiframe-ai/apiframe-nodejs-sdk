const Apiframe = require('@apiframe/sdk');

// Initialize the client
const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function generateImage() {
  try {
    console.log('Creating image generation task...');
    
    // Create an imagine task
    const task = await client.midjourney.imagine({
      prompt: 'a serene mountain landscape at sunset, photorealistic',
      aspect_ratio: '16:9'
    });

    console.log('Task created:', task.task_id);

    // Wait for the task to complete with progress updates
    const result = await client.tasks.waitFor(task.task_id, {
      onProgress: (progress) => {
        console.log('Progress:', progress + '%');
      }
    });

    console.log('Generation complete!');
    console.log('Image URLs:', result.image_urls);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function generateVideo() {
  try {
    console.log('Creating video generation task...');
    
    // Create a video generation task
    const task = await client.midjourney.imagineVideo({
      prompt: 'cinematic mountain landscape',
      image_url: 'https://example.com/start-frame.jpg',
      motion: 'high'
    });

    console.log('Task created:', task.task_id);

    // Wait for completion
    const result = await client.tasks.waitFor(task.task_id);
    console.log('Video URLs:', result.video_urls);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function createVariations() {
  try {
    // First create an image
    const imagineTask = await client.midjourney.imagine({
      prompt: 'a futuristic city skyline'
    });

    const imagineResult = await client.tasks.waitFor(imagineTask.task_id);
    console.log('Original image created');

    // Create variations of the first image
    const variationsTask = await client.midjourney.variations({
      parent_task_id: imagineTask.task_id,
      index: '1' // Can be '1', '2', '3', '4', or 'strong', 'subtle'
    });

    const variationsResult = await client.tasks.waitFor(variationsTask.task_id);
    console.log('Variations created:', variationsResult.image_urls);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function faceSwapExample() {
  try {
    console.log('Creating face swap task...');
    
    const task = await client.midjourney.faceSwap({
      target_image_url: 'https://example.com/target.jpg',
      swap_image_url: 'https://example.com/face.jpg'
    });

    console.log('Task created:', task.task_id);

    const result = await client.tasks.waitFor(task.task_id);
    console.log('Face swap complete:', result.image_url);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function upscaleWorkflow() {
  try {
    // Step 1: Generate an image
    const imagineTask = await client.midjourney.imagine({
      prompt: 'a beautiful sunset over mountains'
    });
    const imagineResult = await client.tasks.waitFor(imagineTask.task_id);
    console.log('Image generated');

    // Step 2: Upscale one of the 4 images (1x)
    const upscale1xTask = await client.midjourney.upscale1x({
      parent_task_id: imagineTask.task_id,
      index: '1'
    });
    const upscale1xResult = await client.tasks.waitFor(upscale1xTask.task_id);
    console.log('Upscaled to 1x:', upscale1xResult.image_url);

    // Step 3: Further upscale with Subtle mode
    const upscaleAltTask = await client.midjourney.upscaleAlt({
      parent_task_id: upscale1xTask.task_id,
      type: 'subtle'
    });
    const upscaleAltResult = await client.tasks.waitFor(upscaleAltTask.task_id);
    console.log('Upscaled with Subtle mode:', upscaleAltResult.image_url);

    // Step 4: Upscale to high resolution (2x or 4x)
    const upscaleHighresTask = await client.midjourney.upscaleHighres({
      image_url: upscaleAltResult.image_url,
      type: '2x'
    });
    const upscaleHighresResult = await client.tasks.waitFor(upscaleHighresTask.task_id);
    console.log('Upscaled to high resolution:', upscaleHighresResult.image_url);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function advancedEditing() {
  try {
    // Generate and upscale an image
    const imagineTask = await client.midjourney.imagine({
      prompt: 'a modern living room'
    });
    await client.tasks.waitFor(imagineTask.task_id);

    const upscale1xTask = await client.midjourney.upscale1x({
      parent_task_id: imagineTask.task_id,
      index: '1'
    });
    await client.tasks.waitFor(upscale1xTask.task_id);

    // Outpaint - Zoom out
    const outpaintTask = await client.midjourney.outpaint({
      parent_task_id: upscale1xTask.task_id,
      zoom_ratio: 2,
      prompt: 'expand the room view'
    });
    const outpaintResult = await client.tasks.waitFor(outpaintTask.task_id);
    console.log('Outpainted image:', outpaintResult.image_url);

    // Pan - Expand in a direction
    const panTask = await client.midjourney.pan({
      parent_task_id: upscale1xTask.task_id,
      direction: 'left'
    });
    const panResult = await client.tasks.waitFor(panTask.task_id);
    console.log('Panned image:', panResult.image_urls);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function otherFeatures() {
  try {
    // Describe an image
    const describeTask = await client.midjourney.describe({
      image_url: 'https://example.com/image.jpg'
    });
    const describeResult = await client.tasks.waitFor(describeTask.task_id);
    console.log('Image descriptions:', describeResult.content);

    // Blend multiple images
    const blendTask = await client.midjourney.blend({
      image_urls: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg'
      ],
      dimension: 'landscape'
    });
    const blendResult = await client.tasks.waitFor(blendTask.task_id);
    console.log('Blended image:', blendResult.image_url);

    // Shorten a prompt
    const shortenTask = await client.midjourney.shorten({
      prompt: 'a very beautiful and amazing sunset over the mountains with clouds'
    });
    const shortenResult = await client.tasks.waitFor(shortenTask.task_id);
    console.log('Shortened prompts:', shortenResult.content);

    // Get seed
    const seedTask = await client.midjourney.seed({
      task_id: 'some_task_id'
    });
    const seedResult = await client.tasks.waitFor(seedTask.task_id);
    console.log('Seed:', seedResult.seed);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
generateImage();


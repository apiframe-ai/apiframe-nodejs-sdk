const Apiframe = require('@apiframe/sdk');

// Initialize the client
const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function generateImagePro() {
  try {
    console.log('Creating image generation task with Pro API...');
    
    // Create an imagine task using the Pro API with Turbo mode
    const task = await client.midjourneyAlt.imagine({
      prompt: 'a serene mountain landscape at sunset, photorealistic, 8k',
      mode: 'turbo' // Pro API supports 'fast' or 'turbo'
    });

    console.log('Task created:', task.id);

    // Wait for the task to complete with progress updates
    const result = await client.tasks.waitFor(task.id, {
      onProgress: (progress) => {
        console.log('Progress:', progress + '%');
      }
    });

    console.log('Generation complete!');
    console.log('Image URL:', result.imageUrl);
    console.log('Download URL:', result.downloadUrl);

    // Example: Upscale one of the generated images
    if (result.id) {
      console.log('\nUpscaling image 1...');
      const upscaleTask = await client.midjourneyAlt.upscale({
        parent_task_id: result.id,
        index: '1', // Upscale the first image
        type: 'subtle' // 'subtle' or 'creative'
      });

      const upscaleResult = await client.tasks.waitFor(upscaleTask.id, {
        onProgress: (p) => console.log('Upscale progress:', p + '%')
      });

      console.log('Upscaled image:', upscaleResult.imageUrl);
    }

    // Example: Create variations
    console.log('\nCreating variations...');
    const varyTask = await client.midjourneyAlt.vary({
      parent_task_id: result.id,
      index: '1',
      type: 'subtle' // 'subtle' or 'strong'
    });

    const varyResult = await client.tasks.waitFor(varyTask.id, {
      onProgress: (p) => console.log('Vary progress:', p + '%')
    });

    console.log('Variations created:', varyResult.imageUrl);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function getAccountInfo() {
  try {
    console.log('\nFetching Pro API account info...');
    const accountInfo = await client.midjourneyAlt.getAccountInfo();
    console.log('Account info:', accountInfo);
  } catch (error) {
    console.error('Error fetching account info:', error.message);
  }
}

// Run the examples
async function main() {
  await generateImagePro();
  await getAccountInfo();
}

main();


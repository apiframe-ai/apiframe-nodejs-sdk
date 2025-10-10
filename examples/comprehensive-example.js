/**
 * Comprehensive example demonstrating all major features of the Apiframe SDK
 * 
 * This example shows:
 * - Multiple API services (Midjourney, Flux, Luma, Suno)
 * - Task management and progress tracking
 * - Error handling
 * - Media upload
 * - Async/await patterns
 */

const { Apiframe } = require('@apiframe-ai/sdk');

// Initialize the client
const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

// Helper function for progress display
function progressBar(progress) {
  const barLength = 30;
  const filled = Math.floor((progress / 100) * barLength);
  const empty = barLength - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  process.stdout.write(`\r[${bar}] ${progress}%`);
}

// Example 1: Midjourney Image Generation
async function midjourneyExample() {
  console.log('\n\n=== Midjourney Image Generation ===\n');
  
  try {
    const task = await client.midjourney.imagine({
      prompt: 'a serene zen garden with a koi pond, cherry blossoms, photorealistic',
      aspect_ratio: '16:9'
    });
    
    console.log('✓ Task created:', task.id);
    
    const result = await client.tasks.waitFor(task.id, {
      onProgress: progressBar,
      interval: 3000
    });
    
    console.log('\n✓ Image generated!');
    console.log('  URL:', result.imageUrl);
    
    return result;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

// Example 2: Flux AI Fast Generation
async function fluxExample() {
  console.log('\n\n=== Flux AI Image Generation ===\n');
  
  try {
    const task = await client.flux.generateSchnell({
      prompt: 'a futuristic cyberpunk cityscape at night, neon lights',
      width: 1024,
      height: 1024
    });
    
    console.log('✓ Task created:', task.id);
    
    const result = await client.tasks.waitFor(task.id, {
      onProgress: progressBar
    });
    
    console.log('\n✓ Image generated!');
    console.log('  URL:', result.image_url);
    
    return result;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

// Example 3: Luma Video Generation
async function lumaExample() {
  console.log('\n\n=== Luma AI Video Generation ===\n');
  
  try {
    const task = await client.luma.generate({
      prompt: 'a peaceful mountain stream with flowing water and surrounding forest',
      aspect_ratio: '16:9'
    });
    
    console.log('✓ Task created:', task.id);
    console.log('  (Video generation takes longer, please wait...)');
    
    const result = await client.tasks.waitFor(task.id, {
      onProgress: progressBar,
      interval: 5000,
      timeout: 600000 // 10 minutes
    });
    
    console.log('\n✓ Video generated!');
    console.log('  URL:', result.video_url);
    
    return result;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

// Example 4: Suno Music Generation
async function sunoExample() {
  console.log('\n\n=== Suno AI Music Generation ===\n');
  
  try {
    const task = await client.suno.generate({
      prompt: 'Create an uplifting electronic dance track with energetic beats',
      model: 'chirp-v3-5',
      tags: 'electronic, dance, upbeat, energetic',
      title: 'Digital Sunrise',
      make_instrumental: false
    });
    
    console.log('✓ Task created:', task.id);
    
    const result = await client.tasks.waitFor(task.id, {
      onProgress: progressBar,
      interval: 5000
    });
    
    console.log('\n✓ Music generated!');
    console.log('  Songs:', result.songs); // Result contains array of 2 songs
    
    return result;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

// Example 5: Error Handling
async function errorHandlingExample() {
  console.log('\n\n=== Error Handling Example ===\n');
  
  const { 
    ApiframeError, 
    AuthenticationError, 
    RateLimitError,
    TimeoutError 
  } = require('@apiframe-ai/sdk');
  
  try {
    // This will fail with invalid parameters
    await client.midjourney.imagine({
      prompt: '' // Empty prompt should fail
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      console.log('✓ Caught authentication error');
    } else if (error instanceof RateLimitError) {
      console.log('✓ Caught rate limit error');
    } else if (error instanceof TimeoutError) {
      console.log('✓ Caught timeout error');
    } else if (error instanceof ApiframeError) {
      console.log('✓ Caught API error:', error.message);
    } else {
      console.log('✓ Caught unknown error:', error.message);
    }
  }
}

// Example 6: Task Management
async function taskManagementExample() {
  console.log('\n\n=== Task Management Example ===\n');
  
  try {
    // Create a task
    const task = await client.midjourney.imagine({
      prompt: 'a simple landscape'
    });
    
    console.log('✓ Task created:', task.id);
    
    // Get task status
    const status = await client.tasks.get(task.id);
    console.log('✓ Task status:', status.status);
    console.log('✓ Task progress:', status.progress);
    
    // Wait for completion
    const result = await client.tasks.waitFor(task.id, {
      onProgress: progressBar
    });
    
    console.log('\n✓ Task completed!');
    
    return result;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

// Example 7: Batch Processing
async function batchProcessingExample() {
  console.log('\n\n=== Batch Processing Example ===\n');
  
  const prompts = [
    'a sunset over mountains',
    'a ocean wave',
    'a forest path'
  ];
  
  try {
    // Create all tasks in parallel
    console.log('Creating tasks...');
    const tasks = await Promise.all(
      prompts.map((prompt, i) => {
        console.log(`  ${i + 1}. "${prompt}"`);
        return client.midjourney.imagine({ prompt });
      })
    );
    
    console.log(`\n✓ ${tasks.length} tasks created`);
    
    // Wait for all in parallel
    console.log('Waiting for completion...');
    const results = await Promise.all(
      tasks.map((task, i) => {
        console.log(`  Waiting for task ${i + 1}...`);
        return client.tasks.waitFor(task.id, {
          onProgress: (p) => console.log(`    Task ${i + 1}: ${p}%`)
        });
      })
    );
    
    console.log(`\n✓ All ${results.length} tasks completed!`);
    results.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.image_urls}`); // imagine returns 4 images
    });
    
    return results;
  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  }
}

// Main function to run all examples
async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Apiframe SDK - Comprehensive Examples       ║');
  console.log('╚════════════════════════════════════════════════╝');
  
  try {
    // Check API key
    if (!process.env.APIFRAME_API_KEY && client.apiKey === 'your_api_key_here') {
      console.log('\n⚠️  Warning: Using placeholder API key');
      console.log('   Set APIFRAME_API_KEY environment variable for real usage\n');
    }
    
    // Run examples
    // Uncomment the ones you want to try
    
    await midjourneyExample();
    // await fluxExample();
    // await lumaExample();
    // await sunoExample();
    // await errorHandlingExample();
    // await taskManagementExample();
    // await batchProcessingExample();
    
    console.log('\n\n✓ All examples completed successfully!\n');
    
  } catch (error) {
    console.error('\n\n✗ Example failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  midjourneyExample,
  fluxExample,
  lumaExample,
  sunoExample,
  errorHandlingExample,
  taskManagementExample,
  batchProcessingExample
};


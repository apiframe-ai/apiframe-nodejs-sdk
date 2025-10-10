const { Apiframe } = require('@apiframe-ai/sdk');

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function generateVideo() {
  try {
    console.log('Generating video with Luma AI...');
    
    const task = await client.luma.generate({
      prompt: 'a serene beach with waves crashing on the shore at sunset',
      aspect_ratio: '16:9',
      loop: false,
      enhance_prompt: true
    });

    console.log('Video generation task created:', task.id);

    const result = await client.tasks.waitFor(task.id, {
      onProgress: (p) => console.log(`Progress: ${p}%`),
      interval: 5000 // Check every 5 seconds
    });

    console.log('Video ready:', result.video_url);

    // Example: Extend the generated video
    console.log('\nExtending the video...');
    const extendTask = await client.luma.extend({
      parent_task_id: task.id,
      prompt: 'the camera pans to show a beautiful sunset over the ocean'
    });

    const extendResult = await client.tasks.waitFor(extendTask.id, {
      onProgress: (p) => console.log(`Extend progress: ${p}%`),
      interval: 5000
    });

    console.log('Extended video ready:', extendResult.video_url);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateVideo();


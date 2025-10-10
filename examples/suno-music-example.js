const Apiframe = require('@apiframe/sdk');

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function generateMusic() {
  try {
    console.log('Generating music with Suno AI...');
    
    // Generate custom music
    const task = await client.suno.custom({
      prompt: 'Create an upbeat electronic dance track with energetic beats',
      tags: 'electronic, dance, upbeat, energetic',
      title: 'Digital Dreams',
      makeInstrumental: false
    });

    console.log('Music generation task created:', task.id);

    const result = await client.tasks.waitFor(task.id, {
      onProgress: (p) => console.log(`Progress: ${p}%`),
      interval: 5000
    });

    console.log('Music ready!');
    console.log('Audio URL:', result.audioUrl);
    
    // Get lyrics if available
    try {
      const lyrics = await client.suno.getLyrics(task.id);
      console.log('Lyrics:', lyrics);
    } catch (e) {
      console.log('No lyrics available for instrumental tracks');
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateMusic();


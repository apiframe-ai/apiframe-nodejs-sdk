const { Apiframe } = require('@apiframe-ai/sdk');

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function generateMusic() {
  try {
    console.log('Generating music with Suno AI...');
    
    // Generate music with lyrics (creates TWO songs)
    const task = await client.suno.generate({
      prompt: 'Create an upbeat electronic dance track with energetic beats',
      lyrics: 'Verse 1: Dancing through the night...\nChorus: Feel the rhythm, feel the beat...',
      model: 'chirp-v3-5',
      tags: 'electronic, dance, upbeat, energetic',
      title: 'Digital Dreams',
      make_instrumental: false
    });

    console.log('Music generation task created:', task.id);

    const result = await client.tasks.waitFor(task.id, {
      onProgress: (p) => console.log(`Progress: ${p}%`),
      interval: 5000,
      timeout: 5 * 60 * 1000 // 5 minutes timeout
    });

    console.log('Music ready!');
    console.log('Songs:', result.songs); // Result will contain array of 2 songs
    
    // Example: Generate lyrics only
    console.log('\nGenerating lyrics...');
    const lyricsTask = await client.suno.generateLyrics({
      prompt: 'a song about summer adventures by the beach'
    });

    const lyricsResult = await client.tasks.waitFor(lyricsTask.id);
    console.log('Generated lyrics:', lyricsResult.lyrics);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateMusic();


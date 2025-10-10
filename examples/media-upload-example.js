const Apiframe = require('@apiframe-ai/sdk');
const fs = require('fs');

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function uploadAndUse() {
  try {
    // Upload image from file path (max 2MB)
    console.log('Uploading image from file...');
    const uploadResult = await client.media.upload({
      file: './path/to/your/image.jpg'
    });
    console.log('Upload successful:', uploadResult.imageURL);

    // Upload audio from file path (max 2MB, 60 seconds)
    console.log('Uploading audio from file...');
    const audioUpload = await client.media.uploadAudio({
      file: './path/to/your/audio.mp3'
    });
    console.log('Audio upload successful:', audioUpload.audioURL);

    // Use the uploaded image with Midjourney blend
    console.log('Creating blend with uploaded image...');
    const blendTask = await client.midjourney.blend({
      images: [uploadResult.imageURL, 'https://example.com/another-image.jpg'],
      aspectRatio: '16:9'
    });

    const result = await client.tasks.waitFor(blendTask.id, {
      onProgress: (p) => console.log(`Blend progress: ${p}%`)
    });

    console.log('Blend complete:', result.imageUrl);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

uploadAndUse();


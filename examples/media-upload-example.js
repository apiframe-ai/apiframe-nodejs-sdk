const { Apiframe } = require('@apiframe-ai/sdk');
const fs = require('fs');

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function uploadAndUse() {
  try {
    // Upload image from file path (max 2MB)
    console.log('Uploading image from file...');
    const uploadResult = await client.media.upload({
      filename: './path/to/your/image.jpg'
    });
    console.log('Upload successful:', uploadResult.imageURL);

    // Upload audio from file path (max 2MB, 60 seconds)
    console.log('Uploading audio from file...');
    const audioUpload = await client.media.uploadAudio({
      filename: './path/to/your/audio.mp3'
    });
    console.log('Audio upload successful:', audioUpload.audioURL);

    // Use the uploaded image with Midjourney blend
    console.log('Creating blend with uploaded image...');
    const blendTask = await client.midjourney.blend({
      image_urls: [uploadResult.imageURL, 'https://example.com/another-image.jpg'],
      dimension: 'portrait'
    });

    const result = await client.tasks.waitFor(blendTask.id, {
      onProgress: (p) => console.log(`Blend progress: ${p}%`)
    });

    console.log('Blend complete:', result.image_url);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

uploadAndUse();


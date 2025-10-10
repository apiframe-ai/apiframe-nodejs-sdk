const { Apiframe } = require('@apiframe-ai/sdk');

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function generateWithFlux() {
  try {
    console.log('Generating image with Flux Pro...');
    
    const task = await client.flux.generate({
      model: 'flux-pro',
      prompt: 'a futuristic cityscape at night, neon lights, cyberpunk style',
      width: 1024,
      height: 1024,
      steps: 50,
      guidance: 7.5,
      seed: 42,
      safety_tolerance: 2
    });

    console.log('Task created:', task.id);

    const result = await client.tasks.waitFor(task.id, {
      onProgress: (p) => console.log(`Progress: ${p}%`)
    });

    console.log('Image ready:', result.imageUrl);

    // Example using convenience method
    console.log('\nGenerating with Flux Schnell (fast)...');
    const schnellTask = await client.flux.generateSchnell({
      prompt: 'a quick sketch of a mountain landscape',
      width: 512,
      height: 512
    });

    const schnellResult = await client.tasks.waitFor(schnellTask.id, {
      onProgress: (p) => console.log(`Progress: ${p}%`)
    });

    console.log('Quick image ready:', schnellResult.imageUrl);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

generateWithFlux();


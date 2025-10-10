/**
 * Comparison example showing the difference between 
 * Original Midjourney API and Pro Midjourney API
 */

const { Apiframe } = require('@apiframe-ai/sdk');

const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function originalAPIExample() {
  console.log('=== Original Midjourney API ===\n');
  
  try {
    // Original API - Basic usage
    const task = await client.midjourney.imagine({
      prompt: 'a beautiful landscape',
      aspectRatio: '16:9',
      model: 'v7'
    });

    console.log('✓ Original API task created:', task.id);

    // Original API has methods like blend, faceSwap, inpaint
    console.log('\nOriginal API features:');
    console.log('- imagine, upscale, vary, zoom, pan');
    console.log('- blend, describe, reroll');
    console.log('- inpaint, faceSwap, shorten');
    console.log('- fetch, fetchMany, getAccountInfo');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function proAPIExample() {
  console.log('\n\n=== Pro Midjourney API (MidjourneyAlt) ===\n');
  
  try {
    // Pro API - With mode selection and seed
    const task = await client.midjourneyAlt.imagine({
      prompt: 'a beautiful landscape',
      aspectRatio: '16:9',
      mode: 'turbo', // Pro-exclusive: fast or turbo
      model: 'v7',
      seed: 12345 // Pro-exclusive: reproducible results
    });

    console.log('✓ Pro API task created:', task.id);

    console.log('\nPro API features:');
    console.log('- imagine, upscale, vary, zoom, pan');
    console.log('- Fast and Turbo modes for speed');
    console.log('- Seed support for reproducibility');
    console.log('- Better stability and faster processing');
    console.log('- getGeneration, getAccountInfo');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Midjourney API Comparison                     ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  await originalAPIExample();
  await proAPIExample();

  console.log('\n\n=== Summary ===\n');
  console.log('Original API (client.midjourney):');
  console.log('  • More features (blend, faceSwap, inpaint)');
  console.log('  • Good for diverse use cases');
  console.log('  • Endpoint: /midjourney/*');
  
  console.log('\nPro API (client.midjourneyAlt):');
  console.log('  • Faster processing with Turbo mode');
  console.log('  • Seed support for reproducibility');
  console.log('  • Better stability');
  console.log('  • Endpoint: /pro/midjourney/*');
  
  console.log('\n✓ Choose based on your needs!');
}

main();


const Apiframe = require('@apiframe/sdk');

// Initialize the client
const client = new Apiframe({
  apiKey: process.env.APIFRAME_API_KEY || 'your_api_key_here'
});

async function fetchTaskExample() {
  try {
    console.log('Fetching task status...');
    
    // Get the status of a single task
    const task = await client.tasks.get('29e983ca-7e86-4017-a9e3-ef6fe9cd5f2a');
    
    console.log('Task status:', task.status);
    console.log('Task data:', task);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function fetchManyTasksExample() {
  try {
    console.log('Fetching multiple tasks...');
    
    // Get the status of multiple tasks (min 2, max 20)
    const result = await client.tasks.getMany([
      'task_id_1',
      'task_id_2',
      'task_id_3'
    ]);
    
    console.log(`Fetched ${result.tasks.length} tasks`);
    result.tasks.forEach((task, index) => {
      console.log(`Task ${index + 1}:`, task.status, task.task_type);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function waitForTaskExample() {
  try {
    console.log('Creating image generation task...');
    
    // Create a task (example with Midjourney)
    const task = await client.midjourney.imagine({
      prompt: 'a beautiful landscape'
    });

    console.log('Task created:', task.task_id);

    // Wait for the task to complete with progress tracking
    console.log('Waiting for task to complete...');
    const result = await client.tasks.waitFor(task.task_id, {
      onProgress: (progress) => {
        console.log(`Progress: ${progress}%`);
      },
      interval: 3000,  // Check every 3 seconds
      timeout: 300000  // Timeout after 5 minutes
    });

    console.log('Task completed!');
    console.log('Result:', result);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

async function getAccountInfoExample() {
  try {
    console.log('Fetching account information...');
    
    // Get account details
    const account = await client.tasks.getAccountInfo();
    
    console.log('Account Information:');
    console.log(`  Email: ${account.email}`);
    console.log(`  Credits: ${account.credits}`);
    console.log(`  Total Images: ${account.total_images}`);
    console.log(`  Plan: ${account.plan}`);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
async function runExamples() {
  console.log('=== Fetch Task Example ===');
  await fetchTaskExample();
  
  console.log('\n=== Fetch Many Tasks Example ===');
  await fetchManyTasksExample();
  
  console.log('\n=== Wait For Task Example ===');
  await waitForTaskExample();
  
  console.log('\n=== Get Account Info Example ===');
  await getAccountInfoExample();
}

// Uncomment to run
// runExamples();

// Run individual example
getAccountInfoExample();


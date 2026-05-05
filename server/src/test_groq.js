
require('dotenv').config();
const llmClient = require('./clients/llmClient');

async function testGroq() {
  console.log('--- TESTING GROQ API CONNECTION ---');
  console.log('Model:', process.env.MODEL || 'llama3-70b-8192');
  console.log('API Key Starts With:', process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 7) + '...' : 'MISSING');

  try {
    console.log('\n1. Testing Sentiment Analysis (Unary)...');
    const sentiment = await llmClient.analyzeSentiment('I love building AI microservices!');
    console.log('Result:', JSON.stringify(sentiment, null, 2));

    console.log('\n2. Testing Text Generation (Streaming)...');
    const stream = llmClient.generateStream('Say hello in 3 words.');
    process.stdout.write('Response: ');
    for await (const token of stream) {
      process.stdout.write(token);
    }
    console.log('\n\n--- TEST COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('\n--- TEST FAILED ---');
    console.error('Error Message:', err.message);
    if (err.response && err.response.data) {
      // The interceptor I added earlier should have already logged the body, 
      // but let's be sure.
      console.error('Error Data:', err.response.data);
    }
  }
}

testGroq();

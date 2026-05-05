
const grpc = require('@grpc/grpc-js');
const llmClient = require('../clients/llmClient');



module.exports = (call, callback) => {
  try {
    let text = '';

    call.on('data', (chunk) => {
      text += chunk.chunk + ' ';
    });

    call.on('end', async () => {
      try {
        const summary = await llmClient.summarize(text.trim());
        callback(null, { summary });
      } catch (err) {
        console.error('Summarization Async Error:', err.message);
        callback({
          code: grpc.status.INTERNAL,
          details: 'LLM Summarization failed: ' + err.message,
        });
      }
    });
  } catch (err) {
    console.error('Summarization Sync Error:', err.message);
    callback({
      code: grpc.status.INTERNAL,
      details: 'LLM Summarization setup failed: ' + err.message,
    });
  }
};
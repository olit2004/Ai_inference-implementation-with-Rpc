const llmClient = require('../clients/llmClient');

module.exports = (call, callback) => {
  let text = '';

  call.on('data', (chunk) => {
    text += chunk.chunk + ' ';
  });

  call.on('end', async () => {
    const summary = await llmClient.summarize(text);
    callback(null, { summary });
  });
};
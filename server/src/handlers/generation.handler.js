
const grpc = require('@grpc/grpc-js');
const llmClient = require('../clients/llmClient');

module.exports = async (call) => {
  try {
    const stream = llmClient.generateStream(call.request.prompt);

    for await (const token of stream) {
      call.write({ token, done: false });
    }

    call.write({ token: '', done: true });
    call.end();
  } catch (err) {
    console.error('Generation Error:', err.message);
    call.emit('error', {
      code: grpc.status.INTERNAL,
      details: 'LLM Generation failed: ' + err.message,
    });
  }
};
const llmClient = require('../clients/llmClient');

module.exports = async (call) => {
  const stream = llmClient.generateStream(call.request.prompt);

  for await (const token of stream) {
    call.write({ token, done: false });
  }

  call.write({ token: '', done: true });
  call.end();
};
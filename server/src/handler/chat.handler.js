const llmClient = require('../clients/llmClient');

module.exports = async (call) => {
  const messages = [];

  call.on('data', async (req) => {
    messages.push({ role: 'user', content: req.message });

    const stream = llmClient.chatStream(messages);

    let fullReply = '';

    for await (const token of stream) {
      fullReply += token;
      call.write({ message: token });
    }

    messages.push({ role: 'assistant', content: fullReply });
  });

  call.on('end', () => call.end());
};
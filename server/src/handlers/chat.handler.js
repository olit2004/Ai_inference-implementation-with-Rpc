
const grpc = require('@grpc/grpc-js');
const llmClient = require('../clients/llmClient');


module.exports = async (call) => {
  try {
    const messages = [];

    call.on('data', async (req) => {
      try {
        messages.push({ role: 'user', content: req.message });

        const stream = llmClient.chatStream(messages);
        let assistantReply = '';

        for await (const token of stream) {
          assistantReply += token;
          call.write({ message: token });
        }

        messages.push({ role: 'assistant', content: assistantReply });
      } catch (err) {
        console.error('Chat stream processing error:', err.message);
        call.emit('error', {
          code: grpc.status.INTERNAL,
          details: 'LLM Chat failed during streaming: ' + err.message,
        });
      }
    });

    call.on('end', () => {
      call.end();
    });
  } catch (err) {
    console.error('Chat setup error:', err.message);
    call.emit('error', {
      code: grpc.status.INTERNAL,
      details: 'LLM Chat setup failed: ' + err.message,
    });
  }
};
const llmClient = require('../clients/llmClient');

module.exports = async (call, callback) => {
  try {
    const result = await llmClient.analyzeSentiment(call.request.text);

    callback(null, result);
  } catch (err) {
    callback(err);
  }
};
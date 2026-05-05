const llmClient = require('../clients/llmClient');

module.exports = async (call, callback) => {
  try {
    // --- CHAOS MODE (Bonus Task 2) ---
    if (process.env.CHAOS_MODE === 'true') {
      console.log('Chaos Mode: Sleeping for 3s to trigger deadline...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const result = await llmClient.analyzeSentiment(call.request.text);

    callback(null, result);
  } catch (err) {
    callback(err);
  }
};


const axios = require('axios');

const API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.MODEL || 'llama3-70b-8192';

const client = axios.create({
  baseURL: 'https://api.groq.com/openai/v1',
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// unary 
async function analyzeSentiment(text) {
  const prompt = `
Classify the sentiment of the following text as POSITIVE, NEGATIVE, or NEUTRAL.
Also provide a confidence score between 0 and 1.

Text: "${text}"

Respond in JSON:
{ "label": "...", "confidence": 0.0 }
`;

  const res = await client.post('/chat/completions', {
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  const content = res.data.choices[0].message.content;
 
   try {
    return JSON.parse(content);
   
    } catch (err) {
        return { label: 'UNKNOWN', confidence: 0.5 };
     }
}



async function* generateStream(prompt) {
  const res = await client.post(
    '/chat/completions',
    {
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    },
    { responseType: 'stream' }
  );

  const stream = res.data;

  for await (const chunk of stream) {
    const lines = chunk.toString().split('\n');

    for (let line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.replace('data: ', '').trim();

        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content;

          if (token) yield token;
        } catch (err) {
          
        }
      }
    }
  }
}


async function summarize(text) {
  const prompt = `
            Summarize the following text concisely:

${text}
`;
  const res = await client.post('/chat/completions', {
    model: MODEL,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
  });

  return res.data.choices[0].message.content;
}




async function* chatStream(messages) {
  const res = await client.post(
    '/chat/completions',
    {
      model: MODEL,
      messages,
      stream: true,
    },
    { responseType: 'stream' }
  );

  const stream = res.data;

  for await (const chunk of stream) {
    const lines = chunk.toString().split('\n');

    for (let line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.replace('data: ', '').trim();

        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const token = parsed.choices?.[0]?.delta?.content;

          if (token) yield token;
        } catch (err) {}
      }
    }
  }
}



module.exports = {
  analyzeSentiment,
  generateStream,
  summarize,
  chatStream,
};
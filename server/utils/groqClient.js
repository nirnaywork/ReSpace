const Groq = require('groq-sdk');

let groqClient = null;

const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

const GROQ_MODEL = 'llama3-70b-8192';

const chatWithGroq = async (messages, options = {}) => {
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: GROQ_MODEL,
    messages,
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 1024,
    ...options,
  });
  return response.choices[0]?.message?.content || '';
};

module.exports = { getGroqClient, chatWithGroq, GROQ_MODEL };

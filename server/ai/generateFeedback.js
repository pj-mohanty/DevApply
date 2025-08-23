const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateFeedback(resumeData) {
  const prompt = `
You are a resume coach. Read the following resume JSON and provide constructive feedback to improve its content, structure, and clarity. Return the feedback in bullet points:

${JSON.stringify(resumeData)}
`;

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.choices[0].message.content;
}

module.exports = { generateFeedback };
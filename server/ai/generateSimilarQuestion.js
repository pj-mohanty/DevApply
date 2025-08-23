const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate a similar interview question based on a previous question.
 * 
 * Input: { previousQuestion: string, type: string }
 * Returns: { type, title, description }
 */
async function generateSimilarQuestion({ previousQuestion, type, context }) {
  if (!previousQuestion || typeof previousQuestion !== 'string') {
    throw new Error('previousQuestion is required and must be a string');
  }

  let systemContent;
  switch (type) {
    case 'Coding':
      systemContent = `You are a technical interviewer. Given a coding question, generate a new similar coding question 
      that practices the same knowledge and skills. Only provide the question text.`;
      break;
    case 'System Design':
      systemContent = `You are a system design interviewer. Given a system design question and context, generate a similar question 
      that evaluates similar design thinking. Only provide the question text.`;
      break;
    case 'Experience':
      systemContent = `You are a behavioral interviewer. Given an experience-based interview question and candidate background, 
      generate a different question that tests the same competencies. Only provide the question text.`;
      break;
    default:
      systemContent = `Generate a similar interview question using the provided context. Only provide the question text.`;
  }

  const messages = [
    { role: 'system', content: systemContent },
    { role: 'user', content: `Previous Question: ${previousQuestion}\nContext: ${JSON.stringify(context)}` },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages,
  });

  return {
    type,
    title: `${type} Similar Question`,
    description: response.choices[0].message.content.trim(),
    context, 
  };
}


module.exports = { generateSimilarQuestion };

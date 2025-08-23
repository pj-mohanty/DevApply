//server/ai/analyzeAnswer
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzeAnswer({ question, userAnswer, type, context }) {
  let prompt;
  
  switch (type) {
    case 'Experience':
      prompt = [
        {
          role: 'system',
          content: `You are a senior interviewer analyzing a behavioral interview answer. if the answer doesn't make any sense, please just say it! and give zero point. Consider:
          1. Relevance to question (0-5) - How well does it answer the question?
          2. Specificity (0-5) - Does it provide concrete examples?
          3. Demonstrated skills (0-5) - What skills does it showcase?
          4. Structure (0-5) - Is it well-organized (STAR method preferred)?
          5. Improvement suggestions - How could it be better?
          
          
          Candidate Background:
          ${JSON.stringify(context.experience)}
          ${JSON.stringify(context.projects)}
          Skills: ${context.skills}
          
          Format response as:
          ### Analysis
          - Relevance: [score]/5
          - Specificity: [score]/5
          - Demonstrated Skills: [score]/5
          - Structure: [score]/5
          
          ### Feedback
          [specific feedback using candidate's background]
          
          ### Suggested Answer Structure
          [STAR method example using candidate's background]`
        },
        {
          role: 'user',
          content: `Question: ${question}\nAnswer: ${userAnswer}`
        }
      ];
      break;

    case 'Coding':
      prompt = [
        {
          role: 'system',
          content: `Analyze the coding answer for:
          1. Correctness (0-5)
          2. Efficiency (0-5)
          3. Readability (0-5)
          4. Edge cases (0-5)
          Format with scores and detailed feedback.
          if the answer doesn't make any sense, please just say it! and give zero point.`
        },
        {
          role: 'user',
          content: `Question: ${question}\nAnswer: ${userAnswer}`
        }
      ];
      break;

    case 'System Design':
      prompt = [
        {
          role: 'system',
          content: `Analyze the system design answer for:
          1. Architecture (0-5)
          2. Scalability (0-5)
          3. Trade-offs (0-5)
          4. Realism (0-5)
          Format with scores and detailed feedback.
          if the answer doesn't make any sense, please just say it! and give zero point.`
        },
        {
          role: 'user',
          content: `Question: ${question}\nAnswer: ${userAnswer}`
        }
      ];
      break;

    default:
      prompt = [
        {
          role: 'system',
          content: `Analyze the answer for quality and relevance. Provide detailed feedback.`
        },
        {
          role: 'user',
          content: `Question: ${question}\nAnswer: ${userAnswer}`
        }
      ];
  }

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: prompt,
  });

  return response.choices[0].message.content;
}

module.exports = { analyzeAnswer };

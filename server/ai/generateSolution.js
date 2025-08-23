// ai/generateSolution.js
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateSolution({ question, type, language, context }) {
  try {
    // Handle coding questions with the existing format
    if (type === 'Coding') {
      const detectedLanguage = language || await detectProgrammingLanguage(question);
      const solution = await generateCompleteCodingSolution(question, detectedLanguage);
      return formatSolutionResponse(solution, detectedLanguage);
    }
    
    // Handle other question types with context
    return await generateContextualSolution(question, type, context);
  } catch (error) {
    console.error('Error in generateSolution:', error);
    return getErrorMessage(error, question);
  }
}

// Keep all existing coding-specific functions unchanged
async function detectProgrammingLanguage(question) {
  const prompt = [
    {
      role: 'system',
      content: 'Identify the primary programming language from this technical question. Respond only with the language name (e.g., "JavaScript", "Python").'
    },
    {
      role: 'user',
      content: question
    }
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: prompt,
    max_tokens: 15,
    temperature: 0.1
  });

  return response.choices[0].message.content.trim();
}

async function generateCompleteCodingSolution(question, language) {
  const prompt = [
    {
      role: 'system',
      content: `You are a senior technical interviewer. Provide a comprehensive solution to the coding question with:
      1. Well-structured code implementation
      2. Brief explanation of the approach
      3. Time and space complexity analysis
      4. Edge cases considered
      5. Alternative solutions if applicable
      
      Format requirements:
      - Use markdown syntax
      - Code blocks with ${language} syntax highlighting
      - Clear section headings
      - Bullet points for key points`
    },
    {
      role: 'user',
      content: `Here is a ${language} coding question:\n\n${question}\n\nPlease solve it in ${language} only.`
    }
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: prompt,
    temperature: 0.3,
    max_tokens: 1500
  });

  return response.choices[0].message.content;
}

function formatSolutionResponse(solution, language) {
  if (!solution.includes('```' + language)) {
    return `### ${language} Solution\n${solution}`;
  }
  return solution;
}

// New function for contextual solutions (non-coding)
async function generateContextualSolution(question, type, context) {
  let prompt;
  
  switch (type) {
    case 'Experience':
      prompt = [
        {
          role: 'system',
          content: `Create a model behavioral answer using:
          1. STAR method (Situation, Task, Action, Result)
          2. Candidate's background: ${JSON.stringify(context)}
          3. Job requirements: ${context.jobDescription}
          
          Format as:
          ### Model Answer
          [STAR-structured response]
          
          ### Key Skills Demonstrated
          [relevant skills from background]
          
          ### Relevance to Position
          [connection to job requirements]`
        },
        {
          role: 'user',
          content: question
        }
      ];
      break;

    case 'System Design':
      prompt = [
        {
          role: 'system',
          content: `Provide a system design solution considering:
          1. Candidate's experience level
          2. Relevant technologies: ${context.skills}
          3. Job requirements
          
          Include:
          1. Architecture overview
          2. Component diagram
          3. Scaling considerations
          4. Trade-off analysis`
        },
        {
          role: 'user',
          content: question
        }
      ];
      break;

    default:
      prompt = [
        {
          role: 'system',
          content: 'Provide a comprehensive answer to the question.'
        },
        {
          role: 'user',
          content: question
        }
      ];
  }

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: prompt,
    temperature: 0.3,
    max_tokens: 1500
  });

  return response.choices[0].message.content;
}

function getErrorMessage(error, question) {
  if (error.response) {
    return `⚠️ Failed to generate solution (API Error). Please try again later.\nQuestion: ${question}`;
  }
  return `⚠️ Error processing your request. Please try again.\nQuestion: ${question}`;
}

module.exports = { 
  generateSolution,
  _private: {
    detectProgrammingLanguage,
    generateCompleteCodingSolution,
    formatSolutionResponse,
    generateContextualSolution
  }
};
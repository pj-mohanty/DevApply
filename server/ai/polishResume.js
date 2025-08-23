const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function polishResume(resumeData) {
  const prompt = `
  You are a professional resume assistant.

  Based on the JSON resume below, polish and improve **all sections**.

  You must specifically:
  - Rewrite each **project** description to be more impressive, action-oriented, and results-driven.
  - Improve each **Work Experience**:
    - Enhance the **description** to be clearer, more impactful, and outcome-based.
    - Rewrite the **keyAchievements** to highlight accomplishments using strong action verbs and measurable results where possible.

  Return a fully updated version of the resume, keeping the exact same structure (including field names).

  Do **not** skip or repeat any field.

  Return only the result as a valid **JSON object** — no markdown, no code block, no explanations.

  Resume:
  ${JSON.stringify(resumeData, null, 2)}
  `;
    // send prompt to OpenAI
  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('⚠️ Failed to parse AI response as JSON:', content);
    return { error: 'Invalid JSON from OpenAI', rawOutput: content };
  }
}

module.exports = { polishResume };
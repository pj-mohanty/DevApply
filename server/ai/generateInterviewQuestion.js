// ai/generateInterviewQuestion.js
const { OpenAI } = require('openai');
const admin = require('firebase-admin');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const db = admin.firestore();

async function generateInterviewQuestion({ uid, applicationId, resumeTag, type }) {
  const [appSnap, resumeSnap] = await Promise.all([
    db.collection('applications').doc(applicationId).get(),
    db.collection('resumes')
      .where('uid', '==', uid)
      .where('tag', '==', resumeTag)
      .limit(1)
      .get(),
  ]);

  if (!appSnap.exists) {
    console.error(`Application not found: ${applicationId}`);
    throw new Error('Application not found');
  }

  if (resumeSnap.empty) {
    console.error(`Resume not found: uid=${uid}, tag=${resumeTag}`);
    throw new Error('Resume not found');
  }

  const jobDesc = appSnap.data().jobDescription || '';
  const resume = resumeSnap.docs[0].data();

  let context;
  switch (type) {
    case 'Coding':
      context = {
        jobDescription: jobDesc,
        requiredSkills: jobDesc.match(/[A-Za-z]+/g) || [],
      };
      break;
    case 'System Design':
      context = {
        jobDescription: jobDesc,
        experience: resume.experience || [],
        projects: resume.projects || [],
        skills: resume.skills || '',
      };
      break;
    case 'Experience':
      context = {
        jobDescription: jobDesc,
        experience: resume.experience || [],
        projects: resume.projects || [],
        skills: resume.skills || '',
      };
      break;
    default:
      context = { jobDescription: jobDesc };
  }

  // Customize prompt based on type
  let systemContent;
  switch (type) {
    case 'Coding':
      systemContent = `You're a technical interviewer. Generate a coding question based on the job description and required skills. 
      The question should test algorithmic thinking and coding skills relevant to the position. Only ask question without say something like "given your background".`;
      break;
    case 'System Design':
      systemContent = `You're a system design interviewer. Generate a system design question based on the job description 
      and candidate's experience, projects and skills. The question should assess architectural thinking. Only ask question without say something like "given your background".`;
      break;
    case 'Experience':
      systemContent = `You're a behavioral interviewer. Generate an experience-based question that asks about the candidate's 
      past work, decision-making, or problem-solving, tailored to their background and the job requirements. Only ask question without say something like "given your background".`;
      break;
    default:
      systemContent = `Generate a ${type} interview question based on the provided context. Only ask question without say something like "given your background".`;
  }

  const prompt = [
    { role: 'system', content: systemContent },
    { role: 'user', content: JSON.stringify(context) },
  ];

  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages: prompt,
  });

  return {
    type,
    title: `${type} Question`,
    description: res.choices[0].message.content,
    context 
  };
}


module.exports = { generateInterviewQuestion };

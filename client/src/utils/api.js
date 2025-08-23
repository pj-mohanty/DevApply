import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL;

export async function submitInterviewEntry(data) {
  const response = await axios.post(`${BASE_URL}/api/interview-entry`, data);
  return response.data;
}

// utils/api.js

export async function getJournalEntries(uid) {
  const res = await axios.get(`${BASE_URL}/api/journal-entries`,{
    params: { uid }
  });
  return res.data; // already structured: [{ jobTitle, company, status, entries: [...] }]
}

//get interview entry by Id
export async function getInterviewEntryById(id) {
  const response = await axios.get(`${BASE_URL}/api/interview-entry/${id}`);
  return response.data;
}

//update interview entry by Id
export async function updateInterviewEntry(id, data) {
  const response = await axios.patch(`${BASE_URL}/api/interview-entry/${id}`, data);
  return response.data;
}

//delete interview entry by Id
export async function deleteInterviewEntry(id) {
  const response = await axios.delete(`${BASE_URL}/api/interview-entry/${id}`);
  return response.data;
}

// save resume
export async function saveResume(userId, formData) {
  const { tag, ...rest } = formData;
  try {
    const response = await axios.post(`${BASE_URL}/api/resume`, {
      uid: userId,
      tag,
      ...rest
    });
    console.log('saveResume() response:', response.data); 
    return response.data;
  } catch (err) {
    console.error('saveResume() error:', err.response?.data?.error || err.message);
    throw new Error(err.response?.data?.error || 'Failed to save resume.');
  }
}

// get resume by tag
export async function getResumeByTag(userId,tag) {
  const response = await axios.get(`${BASE_URL}/api/resume/${userId}/${tag}`);
  return response.data;
}

// get all tags
export async function getAllResumes(userId) {
  const response = await axios.get(`${BASE_URL}/api/resume/${userId}`);
  return response.data; // [{ tag: "AI", fullName: "Pengfang", ... }, {...}]
}
// update resume by document ID
export async function updateResumeById(resumeId, data) {
  const response = await axios.patch(`${BASE_URL}/api/resume/${resumeId}`, data);
  return response.data;
}

// update resume by uid + tag
export async function updateResumeByTag(uid, tag, data) {
  const response = await axios.patch(`${BASE_URL}/api/resume-by-tag/${uid}/${tag}`, data);
  return response.data;
}

// delete resume by document ID
export async function deleteResumeById(resumeId) {
  const response = await axios.delete(`${BASE_URL}/api/resume/${resumeId}`);
  return response.data;
}

//get resume by document ID
export async function getResumeById(id) {
  try {
    const res = await axios.get(`${BASE_URL}/api/resume-by-id/${id}`);
    return res.data; 
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
    throw err;
  }
}

// get latest resume by userID
export async function getLatestResume(uid) {
  const res = await axios.get(`${BASE_URL}/api/resume-latest/${uid}`);
  return res.data;
}

export async function deleteResumeByTag(uid, tag) {
  const res = await axios.delete(`${BASE_URL}/api/resume-by-tag/${uid}/${tag}`);
  return res.data;
}

//post AI suggestion
export async function getAISuggestion(resumeData) {
  const res = await axios.post(`${BASE_URL}/api/ai/feedback`, { resumeData });
  return res.data.feedback; 
}

//post polish resume by AI
export async function polishResumeByAI(resumeData) {
  const res = await axios.post(`${BASE_URL}/api/ai/polish`, resumeData);
  return res.data;
}

// Generate AI question
export async function generateInterviewQuestion({ uid, applicationId, resumeTag, type }) {
  const response = await axios.post(`${BASE_URL}/api/ai/generateInterviewQuestion`, {
    uid,
    applicationId,
    resumeTag,
    type,
  });
  return response.data;
}

// Analyze Answer
export async function analyzeAnswer({ question, userAnswer, type, context }) {
  const response = await axios.post(`${BASE_URL}/api/ai/analyzeAnswer`, {
    question,
    userAnswer,
    type,
    context,
  });
  return response.data;
}

// Generate Solution
export async function generateSolution({ question, type, context, language }) {
  const response = await axios.post(`${BASE_URL}/api/ai/generateSolution`, {
    question,
    type,
    context,
    language,
  });
  return response.data;
}

export async function saveUserAnswer({
  uid,
  applicationId,
  type,
  question,
  userAnswer,
  aiAnalysis,
  aiSolution,
  language,
  positionDisplay,
  context = {}
}) {
  try {
    const response = await axios.post(`${BASE_URL}/api/saveInterviewHistory`, {
      uid,
      applicationId,
      type,
      question,
      userAnswer,
      aiAnalysis: typeof aiAnalysis === 'object' ? JSON.stringify(aiAnalysis) : aiAnalysis,
      aiSolution: typeof aiSolution === 'object' ? JSON.stringify(aiSolution) : aiSolution,
      language,
      positionDisplay,
      context: {
        experience: context.experience || [],
        projects: context.projects || [],
        skills: context.skills || []
      }
    });

    return response.data;
  } catch (err) {
    console.error('saveUserAnswer() error:', err.response?.data?.error || err.message);
    throw new Error(err.response?.data?.error || 'Failed to save answer.');
  }
}

// Interview History Functions
export async function getInterviewHistoryByPosition(uid, filters = {}) {
  try {
    const response = await axios.get(`${BASE_URL}/api/interviewHistoryByPosition/${uid}`, {
      params: filters
    });
    return response.data;
  } catch (err) {
    console.error('getInterviewHistoryByPosition() error:', err);
    throw new Error(err.response?.data?.error || 'Failed to fetch interview history by position');
  }
}

export async function getInterviewHistory(uid, filters = {}) {
  try {
    const response = await axios.get(`${BASE_URL}/api/interviewHistory/${uid}`, {
      params: filters
    });
    return response.data;
  } catch (err) {
    console.error('getInterviewHistory() error:', err);
    throw new Error(err.response?.data?.error || 'Failed to fetch interview history');
  }
}

// Generate similar interview question
export async function generateSimilarQuestion({ previousQuestion, type, context }) {
  try {
    const response = await axios.post(`${BASE_URL}/api/generateSimilarQuestion`, {
      previousQuestion,
      type,
      context,
    });
    return response.data;
  } catch (err) {
    console.error('generateSimilarQuestion() error:', err);
    throw new Error(err.response?.data?.error || 'Failed to generate similar question');
  }
}

//Delete Question
export async function deleteQuestionHistory(id) {
  try {
    const response = await axios.delete(`${BASE_URL}/api/deleteQuestion/${id}`);
    return response.data;
  } catch (err) {
    console.error('API Error:', err);
    throw err; 
  }
}

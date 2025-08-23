const express = require('express');
const router = express.Router();
const { generateFeedback } = require('../ai/generateFeedback');
const { polishResume } = require('../ai/polishResume');
const { generateInterviewQuestion } = require('../ai/generateInterviewQuestion'); 
const { analyzeAnswer } = require('../ai/analyzeAnswer');
const { generateSolution } = require('../ai/generateSolution');
const { generateSimilarQuestion } = require('../ai/generateSimilarQuestion'); 
//AI polish resume 
router.post('/ai/polish', async (req, res) => {
  try {
    const result = await polishResume(req.body); // Call OpenAI and return a structured polished result
    console.log('polish resume from AI: ',JSON.stringify(result,null,2))
    res.status(200).json(result);// Return the structured result to the frontend
  } catch (err) {
    console.error('AI polish error:', err);
    res.status(500).json({ error: 'Failed to polish resume' });
  }
});

//AI suggestion
router.post('/ai/feedback', async (req, res) => {
  try {
    const feedback = await generateFeedback(req.body);
    res.status(200).json({ feedback });
  } catch (err) {
    console.error('Feedback error:', err);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
});
// AI Interview: Generate Question
router.post('/ai/generateInterviewQuestion', async (req, res) => {
  try {
    const { uid, applicationId, resumeTag, type } = req.body;
    
    if (!uid || !applicationId || !resumeTag || !type) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = await generateInterviewQuestion({ uid, applicationId, resumeTag, type });
    res.status(200).json({ 
      question: result.description,
      type: result.type,
      context: result.context 
    });
  } catch (err) {
    console.error('Interview question generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate question',
      details: err.message 
    });
  }
});

// AI Interview: Analyze Answer 
router.post('/ai/analyzeAnswer', async (req, res) => {
  try {
    const { question, userAnswer, type, context } = req.body;
    
    if (!question || !userAnswer || !type) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = await analyzeAnswer({ question, userAnswer, type, context });
    res.status(200).json({ 
      analysis: result 
    });
  } catch (err) {
    console.error('Answer analysis error:', err);
    res.status(500).json({ 
      error: 'Failed to analyze answer',
      details: err.message 
    });
  }
});

// AI Interview: Generate Solution
router.post('/ai/generateSolution', async (req, res) => {
  try {
    const { question, type, language, context } = req.body;
    
    if (!question || !type) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const result = await generateSolution({ question, type, language, context });
    res.status(200).json({ 
      solution: result 
    });
  } catch (err) {
    console.error('Solution generation error:', err);
    res.status(500).json({ 
      error: 'Failed to generate solution',
      details: err.message 
    });
  }
});
//Similar question
router.post('/generateSimilarQuestion', async (req, res) => {
  try {
    const { previousQuestion, type } = req.body;
    if (!previousQuestion || !type) {
      return res.status(400).json({ error: 'previousQuestion and type are required' });
    }
    const question = await generateSimilarQuestion({ previousQuestion, type });
    res.json(question);
  } catch (error) {
    console.error('Error generating similar question:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});


module.exports = router;
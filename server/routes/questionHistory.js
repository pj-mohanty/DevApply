//server/routes/questionHistory.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

const HISTORY_COLLECTION = 'histories';

// Save Interview Question History
router.post('/saveInterviewHistory', async (req, res) => {
  try {
    const {
      uid,
      question,
      userAnswer,
      type,
      context,
      aiAnalysis,
      aiSolution,
      applicationId, 
      language,
      positionDisplay
    } = req.body;

    if (!uid || !question || !userAnswer || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const safeContext = {
      experience: context.experience || [],
      projects: context.projects || [],
      skills: context.skills || [],
    };

    const historyEntry = {
      uid,
      question,
      userAnswer,
      type,
      context: safeContext,
      applicationId: applicationId || null,
      language: language || null,
      aiAnalysis: aiAnalysis || '',
      aiSolution: aiSolution || '',
      positionDisplay: positionDisplay || null,  
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection(HISTORY_COLLECTION).add(historyEntry);
    res.status(200).json({ message: 'History saved successfully', id: docRef.id });
  } catch (error) {
    console.error('Error saving interview history:', error);
    res.status(500).json({ error: 'Failed to save interview history', details: error.message });
  }
});
// Get Interview History by Position Display with all fields
router.get('/interviewHistory/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { positionDisplay, type, limit = 10 } = req.query;

    const historyRef = db.collection(HISTORY_COLLECTION); 

    let query = historyRef.where('uid', '==', uid);
    if (positionDisplay) query = query.where('positionDisplay', '==', positionDisplay);
    if (type) query = query.where('type', '==', type);

    const snapshot = await query.limit(Number(limit)).get();

    const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(history);
  } catch (error) {
    console.error('Error fetching interview history:', error);
    res.status(500).json({ error: 'Failed to fetch interview history', details: error.message });
  }
});
// Delete a question from history
router.delete('/deleteQuestion/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    // Verify the question exists and belongs to the user (optional security check)
    // You might want to add user verification here if needed

    await db.collection(HISTORY_COLLECTION).doc(id).delete();
    
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question', details: error.message });
  }
});

module.exports = router;


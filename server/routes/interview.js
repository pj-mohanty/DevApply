const express = require('express');
const router = express.Router();
const db = require('../firebase');

// save new entry
router.post('/interview-entry', async (req, res) => {
  try {
    const {
      uid,
      applicationId,
      company,
      jobTitle,
      questionType,
      question,
      response,
      notes,
      link,
      type,     // new add
      date,
      interviewDate,
      interviewName  
    } = req.body;

    if (!uid || !question || !response) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newDoc = {
      uid,
      applicationId,
      company,
      jobTitle,
      questionType,
      question,
      response,
      notes,
      link,
      type,     // Add the field to be saved
      date,
      interviewDate,
      interviewName: req.body.interviewName || '', // Add interviewName  
      createdAt: new Date()
    };

    const docRef = await db.collection("interviewEntries").add(newDoc);

    res.status(201).json({
      message: 'Interview entry saved!',
      id: docRef.id
    });
  } catch (error) {
    console.error("Error saving interview entry:", error);
    res.status(500).json({ error: 'Failed to save entry' });
  }
});

// Get interview entry by ID
router.get('/interview-entry/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const docRef = db.collection("interviewEntries").doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.status(200).json({ id: docSnap.id, ...docSnap.data() });
  } catch (error) {
    console.error("Error fetching interview entry:", error);
    res.status(500).json({ error: 'Failed to fetch entry' });
  }
});

// Update interview entry by ID
router.patch('/interview-entry/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No update data provided' });
    }

    const docRef = db.collection('interviewEntries').doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    await docRef.update(updateData);

    res.status(200).json({ message: 'Interview entry updated successfully' });
  } catch (error) {
    console.error('Error updating interview entry:', error);
    res.status(500).json({ error: 'Failed to update entry' });
  }
});

// Delete interview entry by ID
router.delete('/interview-entry/:id', async (req, res) => {
  try {
    const docId = req.params.id;
    const docRef = db.collection('interviewEntries').doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    await docRef.delete();

    res.status(200).json({ message: 'Interview entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting interview entry:', error);
    res.status(500).json({ error: 'Failed to delete entry' });
  }
});

module.exports = router;
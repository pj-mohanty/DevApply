const express = require('express');
const router = express.Router();
const db = require('../firebase');

// POST /api/applications
router.post('/applications', async (req, res) => {
  try {
    const {uid, jobTitle, company, status, dateApplied, applicationLink, jobDescription, resume } = req.body;
    if (!uid||!jobTitle || !company || !status || !dateApplied) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    const newApp = {
      uid,
      jobTitle,
      company,
      status,
      dateApplied,
      applicationLink: applicationLink || '',
      jobDescription,
      resume: resume || '', 
      createdAt: new Date(),
    };

    const docRef = await db.collection('applications').add(newApp);
    const savedDoc = await docRef.get();
    res.status(201).json({ id: savedDoc.id, ...savedDoc.data() });
  } catch (err) {
    console.error('Error adding application:', err);
    res.status(500).json({ error: 'Failed to add application' });
  }
});

// GET /api/applications
router.get('/applications', async (req, res) => {
  const { uid } = req.query;

  try {
    let query =db.collection('applications');
    if (uid) {
      query = query.where('uid', '==', uid);
    }

    const snapshot = await query.get();
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.json(applications);
  } catch (err) {
    console.error('Error fetching applications:', err);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// GET /api/applications/:id
router.get('/applications/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('applications').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Error fetching application:', err);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// GET /api/applications/:id/jobDescription
router.get('/applications/:id/jobDescription', async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await db.collection('applications').doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ jobDescription: doc.data().jobDescription || '' });
  } catch (err) {
    console.error('Error fetching job description:', err);
    res.status(500).json({ error: 'Failed to fetch job description' });
  }
});

// PUT /api/applications/:id
router.put('/applications/:id', async (req, res) => {
  const { id } = req.params;
  const { jobTitle, company, status, dateApplied, applicationLink, jobDescription, resume } = req.body;

  try {
    const docRef = db.collection('applications').doc(id);
    await docRef.update({
      jobTitle,
      company,
      status,
      dateApplied, 
      applicationLink: applicationLink || '',
      jobDescription,
      resume: resume || '',
      updatedAt: new Date()
    });

    const updatedDoc = await docRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (err) {
    console.error('Error updating application:', err);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// DELETE /api/applications/:id
router.delete('/applications/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection('applications').doc(id).delete();
    res.status(204).end();
  } catch (err) {
    console.error('Error deleting application:', err);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
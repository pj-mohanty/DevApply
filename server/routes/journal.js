const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const db = admin.firestore();

router.get('/journal-entries', async (req, res) => {
  try {
    const uid = req.query.uid; //get uid from frontend

    if (!uid) {
      return res.status(400).json({ error: 'Missing uid in query' });
    }

    const appsSnap = await db.collection('applications')
      .where('uid', '==', uid)
      .get();

    const entriesSnap = await db.collection('interviewEntries')
      .where('uid', '==', uid)
      .get();

    const applications = appsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const entries = entriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Associate each application and entry using applicationId
    const result = applications.map(app => ({
      id: app.id,
      jobTitle: app.jobTitle,
      company: app.company,
      status: app.status,
      entries: entries.filter(e => e.applicationId === app.id)
      .map(e => ({
          ...e,
          interviewName: e.interviewName || '', // Ensure interviewName is present
        }))
    }));
    
    //Add unlinked entries (no applicationId)
    const unlinkedEntries = entries
    .filter(e => !e.applicationId)
    .map(e => ({
        ...e,
        interviewName: e.interviewName || '',
    }));

    if (unlinkedEntries.length > 0) {
      result.push({
        id: null,
        jobTitle: null,
        company: null,
        status: null,
        entries: unlinkedEntries
      });
    }

    res.json(result);
  } catch (err) {
    console.error('🔥 Error fetching data:', err);
    res.status(500).json({ error: 'Failed to load journal entries' });
  }
});

module.exports = router;
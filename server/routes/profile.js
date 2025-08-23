const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET profile (fetch user-specific profile)
router.get('/profile', async (req, res) => {
  try {
    const { uid } = req.query;
    
    if (!uid) {
      return res.status(400).json({ error: 'User ID (uid) is required' });
    }

    const snapshot = await db.collection('profiles').where('uid', '==', uid).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'No profile found for this user' });
    }
    const doc = snapshot.docs[0];
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT profile (update user-specific profile)
router.put('/profile', async (req, res) => {
  try {
    const { uid, name, location, skills, education, experience, bio, linkedinId, leetcodeId, githubId, portfolioId } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'User ID (uid) is required' });
    }

    const snapshot = await db.collection('profiles').where('uid', '==', uid).limit(1).get();
    if (snapshot.empty) {
      const docRef = await db.collection('profiles').add({
        uid,
        name, location, skills, education, experience, bio, linkedinId, leetcodeId, githubId, portfolioId,
        createdAt: new Date()
      });
      const newDoc = await docRef.get();
      return res.json({ id: newDoc.id, ...newDoc.data() });
    } else {
      const doc = snapshot.docs[0];
      await db.collection('profiles').doc(doc.id).set({
        uid,
        name, location, skills, education, experience, bio, linkedinId, leetcodeId, githubId, portfolioId,
        updatedAt: new Date()
      }, { merge: true });
      const updatedDoc = await db.collection('profiles').doc(doc.id).get();
      res.json({ id: updatedDoc.id, ...updatedDoc.data() });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

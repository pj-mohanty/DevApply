const express = require('express');
const router = express.Router();
const db = require('../firebase');
const admin = require('firebase-admin'); 
//save resume
router.post('/resume', async (req, res) => {
  try {
    const { uid, tag, id, ...resumeData } = req.body;

    if (!uid || !tag) {
      return res.status(400).json({ error: 'Missing uid or tag' });
    }

    const snapshot = await db.collection('resumes')
      .where('uid', '==', uid)
      .where('tag', '==', tag)
      .get();

    if (!snapshot.empty) {
      // const docRef = snapshot.docs[0].ref;
      // await docRef.update({
      //   ...resumeData,
      //   updatedAt: admin.firestore.FieldValue.serverTimestamp()
      // });
      return res.status(400).json({ error: 'This tag already exists. Please use a unique tag.' });
    } else {
      const docRef = await db.collection('resumes').add({
        uid,
        tag,
        ...resumeData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return res.status(201).json({ message: 'Resume created',id: docRef.id });
    }
  } catch (error) {
    console.error('Failed to save resume:', error);
    return res.status(500).json({ error: 'Failed to save resume' });
  }
});

//get resume by tag
router.get('/resume/:uid/:tag', async (req, res) => {
  const { uid, tag } = req.params;

  try {
    const snapshot = await db.collection('resumes')
      .where('uid', '==', uid)
      .where('tag', '==', tag)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const doc = snapshot.docs[0];
    res.status(200).json(doc.data());
  } catch (err) {
    console.error('Error fetching resume:', err);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// get resume by id
router.get('/resume-by-id/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await db.collection('resumes').doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Error fetching resume by ID:', err);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// get all resumes
router.get('/resume/:uid', async (req, res) => {
  try {
    const uid = req.params.uid;

    if (!uid) {
      return res.status(400).json({ error: 'Missing uid' });
    }

    const snapshot = await db.collection('resumes')
      .where('uid', '==', uid)
      .get();

    const resumes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(resumes);
  } catch (err) {
    console.error('Error fetching resumes:', err);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// edit resume by id
router.patch('/resume/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    await db.collection('resumes').doc(id).update(updates);

    res.status(200).json({ message: 'Resume updated successfully' });
  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// edit resume by tag
router.patch('/resume-by-tag/:uid/:tag', async (req, res) => {
  const { uid, tag } = req.params;
  const updates = req.body;

  try {
    const snapshot = await db.collection('resumes')
      .where('uid', '==', uid)
      .where('tag', '==', tag)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const docRef = snapshot.docs[0].ref;
    await docRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({ message: 'Resume updated successfully' });
  } catch (error) {
    console.error('Error updating resume by tag:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// delete resume by id
router.delete('/resume/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.collection('resumes').doc(id).delete();
    res.status(200).json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// get latest resume
router.get('/resume-latest/:uid', async (req, res) => {
  const uid = req.params.uid;

  try {
    const snapshot = await db
      .collection('resumes')
      .where('uid', '==', uid)
      .orderBy('updatedAt', 'desc') 
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No resume found' });
    }

    const doc = snapshot.docs[0];
    return res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error('Error fetching latest resume:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// delete resume by tag
router.delete('/resume-by-tag/:uid/:tag', async (req, res) => {
  const { uid, tag } = req.params;

  const snapshot = await db.collection('resumes')
    .where('uid', '==', uid)
    .where('tag', '==', tag)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return res.status(404).json({ error: 'Resume not found' });
  }

  await snapshot.docs[0].ref.delete();
  res.status(200).json({ message: 'Resume deleted' });
});

// Get only projects from a specific resume
router.get('/resume-projects/:uid/:tag', async (req, res) => {
  const { uid, tag } = req.params;

  try {
    const snapshot = await db.collection('resumes')
      .where('uid', '==', uid)
      .where('tag', '==', tag)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const doc = snapshot.docs[0].data();
    res.status(200).json({ projects: doc.projects || [] });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get only experience from a specific resume
router.get('/resume-experience/:uid/:tag', async (req, res) => {
  const { uid, tag } = req.params;

  try {
    const snapshot = await db.collection('resumes')
      .where('uid', '==', uid)
      .where('tag', '==', tag)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const doc = snapshot.docs[0].data();
    res.status(200).json({ experience: doc.experience || [] });
  } catch (error) {
    console.error('Error fetching experience:', error);
    res.status(500).json({ error: 'Failed to fetch experience' });
  }
});

// Get only skills from a specific resume
router.get('/resume-skills/:uid/:tag', async (req, res) => {
  const { uid, tag } = req.params;

  try {
    const snapshot = await db.collection('resumes')
      .where('uid', '==', uid)
      .where('tag', '==', tag)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    const doc = snapshot.docs[0].data();
    res.status(200).json({ skills: doc.skills || '' });
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});


module.exports = router;
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();
const db = admin.firestore();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Basic endpoint to add an email to the waitlist
app.post('/addWaitlist', async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Prevent exact-duplicate entries
    const snapshot = await db.collection('waitlist').where('email', '==', email).limit(1).get();
    if (!snapshot.empty) {
      return res.status(200).json({ ok: true, message: 'Already subscribed' });
    }

    await db.collection('waitlist').add({ email, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    return res.json({ ok: true });
  } catch (err) {
    console.error('addWaitlist error', err);
    return res.status(500).json({ error: 'internal' });
  }
});

exports.app = functions.https.onRequest(app);

const express = require('express');
const router = express.Router();
const admin = require('../utils/firebaseAdmin');

// POST /api/notifications/send
router.post('/send', async (req, res) => {
  const { token, title, body, data } = req.body;
  if (!token || !title || !body) {
    return res.status(400).json({ success: false, message: 'token, title, and body are required' });
  }
  try {
    const message = {
      token,
      notification: { title, body },
      data: data || {},
    };
    const response = await admin.messaging().send(message);
    res.json({ success: true, message: 'Notification sent', response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 
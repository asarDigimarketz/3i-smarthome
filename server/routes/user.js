const express = require('express');
const router = express.Router();
const User = require('../models/user'); // Adjust path as needed

// POST /api/user/register-token
router.post('/register-token', async (req, res) => {
  const { userId, token, platform } = req.body;
  if (!userId || !token || !platform) {
    return res.status(400).json({ success: false, message: 'userId, token, and platform are required' });
  }
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.pushTokens) user.pushTokens = [];
    // Prevent duplicates
    if (!user.pushTokens.some(t => t.token === token && t.platform === platform)) {
      user.pushTokens.push({ token, platform });
      await user.save();
    }
    res.json({ success: true, message: 'Token registered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 
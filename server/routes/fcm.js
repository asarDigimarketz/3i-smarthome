const express = require('express');
const router = express.Router();
const {
  registerToken,
 
  testNotification,
} = require('../controllers/fcmController');

// Register FCM token
router.post('/token', registerToken);



// Test notification endpoint
router.post('/test', testNotification);

module.exports = router; 
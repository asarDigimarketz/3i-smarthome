// Firebase Notification Backend Implementation
// npm install firebase-admin express cors dotenv

const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Firebase Admin SDK initialization
let firebaseApp = null;

const initializeFirebase = (serviceAccount, projectId) => {
  try {
    if (firebaseApp) {
      // Delete existing app if already initialized
      admin.apps.forEach(app => app.delete());
    }
   
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });
   
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
};

// Configuration endpoint
app.post('/api/configure-firebase', async (req, res) => {
  try {
    const { projectId, serviceAccount } = req.body;
   
    if (!projectId || !serviceAccount) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and service account are required'
      });
    }
   
    // Validate service account structure
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccount[field]);
   
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
   
    const initialized = initializeFirebase(serviceAccount, projectId);
   
    if (initialized) {
      res.json({
        success: true,
        message: 'Firebase configured successfully',
        projectId: projectId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to initialize Firebase'
      });
    }
  } catch (error) {
    console.error('Configuration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during configuration'
    });
  }
});

// Send single notification
app.post('/api/send-notification', async (req, res) => {
  try {
    if (!firebaseApp) {
      return res.status(400).json({
        success: false,
        message: 'Firebase not configured. Please configure first.'
      });
    }
   
    const { token, title, body, data = {} } = req.body;
   
    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Token, title, and body are required'
      });
    }
   
    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data,
      token: token
    };
   
    const response = await admin.messaging().send(message);
   
    res.json({
      success: true,
      message: 'Notification sent successfully',
      messageId: response
    });
   
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
});

// Send bulk notifications
app.post('/api/send-bulk-notifications', async (req, res) => {
  try {
    if (!firebaseApp) {
      return res.status(400).json({
        success: false,
        message: 'Firebase not configured. Please configure first.'
      });
    }
   
    const { tokens, title, body, data = {} } = req.body;
   
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array is required and must not be empty'
      });
    }
   
    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Title and body are required'
      });
    }
   
    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data,
      tokens: tokens
    };
   
    const response = await admin.messaging().sendMulticast(message);
   
    res.json({
      success: true,
      message: 'Bulk notifications sent',
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    });
   
  } catch (error) {
    console.error('Send bulk notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notifications',
      error: error.message
    });
  }
});

// Send notification to topic
app.post('/api/send-topic-notification', async (req, res) => {
  try {
    if (!firebaseApp) {
      return res.status(400).json({
        success: false,
        message: 'Firebase not configured. Please configure first.'
      });
    }
   
    const { topic, title, body, data = {} } = req.body;
   
    if (!topic || !title || !body) {
      return res.status(400).json({
        success: false,
        message: 'Topic, title, and body are required'
      });
    }
   
    const message = {
      notification: {
        title: title,
        body: body
      },
      data: data,
      topic: topic
    };
   
    const response = await admin.messaging().send(message);
   
    res.json({
      success: true,
      message: 'Topic notification sent successfully',
      messageId: response
    });
   
  } catch (error) {
    console.error('Send topic notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send topic notification',
      error: error.message
    });
  }
});

// Subscribe tokens to topic
app.post('/api/subscribe-to-topic', async (req, res) => {
  try {
    if (!firebaseApp) {
      return res.status(400).json({
        success: false,
        message: 'Firebase not configured. Please configure first.'
      });
    }
   
    const { tokens, topic } = req.body;
   
    if (!tokens || !Array.isArray(tokens) || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array and topic are required'
      });
    }
   
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
   
    res.json({
      success: true,
      message: 'Tokens subscribed to topic successfully',
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.errors
    });
   
  } catch (error) {
    console.error('Subscribe to topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to topic',
      error: error.message
    });
  }
});

// Unsubscribe tokens from topic
app.post('/api/unsubscribe-from-topic', async (req, res) => {
  try {
    if (!firebaseApp) {
      return res.status(400).json({
        success: false,
        message: 'Firebase not configured. Please configure first.'
      });
    }
   
    const { tokens, topic } = req.body;
   
    if (!tokens || !Array.isArray(tokens) || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Tokens array and topic are required'
      });
    }
   
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
   
    res.json({
      success: true,
      message: 'Tokens unsubscribed from topic successfully',
      successCount: response.successCount,
      failureCount: response.failureCount,
      errors: response.errors
    });
   
  } catch (error) {
    console.error('Unsubscribe from topic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from topic',
      error: error.message
    });
  }
});

// Validate device token
app.post('/api/validate-token', async (req, res) => {
  try {
    if (!firebaseApp) {
      return res.status(400).json({
        success: false,
        message: 'Firebase not configured. Please configure first.'
      });
    }
   
    const { token } = req.body;
   
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }
   
    // Try to send a test message to validate token
    const testMessage = {
      data: {
        test: 'validation'
      },
      token: token
    };
   
    await admin.messaging().send(testMessage);
   
    res.json({
      success: true,
      message: 'Token is valid',
      token: token
    });
   
  } catch (error) {
    console.error('Token validation error:', error);
    res.json({
      success: false,
      message: 'Token is invalid or expired',
      error: error.message
    });
  }
});

// Get Firebase configuration status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    configured: firebaseApp !== null,
    timestamp: new Date().toISOString()
  });
});

// Notification Templates
const notificationTemplates = {
  welcome: {
    title: 'Welcome!',
    body: 'Thanks for joining our app!'
  },
  promotion: {
    title: 'Special Offer!',
    body: 'Check out our latest deals and discounts!'
  },
  reminder: {
    title: 'Don\'t forget!',
    body: 'You have pending tasks to complete.'
  },
  update: {
    title: 'App Update',
    body: 'A new version of the app is available.'
  }
};

// Send templated notification
app.post('/api/send-template-notification', async (req, res) => {
  try {
    if (!firebaseApp) {
      return res.status(400).json({
        success: false,
        message: 'Firebase not configured. Please configure first.'
      });
    }
   
    const { token, templateName, customData = {} } = req.body;
   
    if (!token || !templateName) {
      return res.status(400).json({
        success: false,
        message: 'Token and template name are required'
      });
    }
   
    const template = notificationTemplates[templateName];
    if (!template) {
      return res.status(400).json({
        success: false,
        message: 'Template not found',
        availableTemplates: Object.keys(notificationTemplates)
      });
    }
   
    const message = {
      notification: {
        title: template.title,
        body: template.body
      },
      data: {
        template: templateName,
        ...customData
      },
      token: token
    };
   
    const response = await admin.messaging().send(message);
   
    res.json({
      success: true,
      message: 'Template notification sent successfully',
      template: templateName,
      messageId: response
    });
   
  } catch (error) {
    console.error('Send template notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send template notification',
      error: error.message
    });
  }
});

// Get available templates
app.get('/api/templates', (req, res) => {
  res.json({
    success: true,
    templates: notificationTemplates
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Firebase Notification Server running on port ${PORT}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`POST /api/configure-firebase - Configure Firebase`);
  console.log(`POST /api/send-notification - Send single notification`);
  console.log(`POST /api/send-bulk-notifications - Send bulk notifications`);
  console.log(`POST /api/send-topic-notification - Send topic notification`);
  console.log(`POST /api/subscribe-to-topic - Subscribe to topic`);
  console.log(`POST /api/unsubscribe-from-topic - Unsubscribe from topic`);
  console.log(`POST /api/validate-token - Validate device token`);
  console.log(`POST /api/send-template-notification - Send template notification`);
  console.log(`GET /api/status - Get configuration status`);
  console.log(`GET /api/templates - Get available templates`);
});

module.exports = app;
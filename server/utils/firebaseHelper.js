const admin = require('firebase-admin');

class FirebaseNotificationHelper {
  constructor() {
    this.app = null;
  }

  // Initialize Firebase with service account
  initialize(serviceAccount, projectId) {
    try {
      if (this.app) {
        // Delete existing app if already initialized
        admin.apps.forEach(app => app.delete());
      }

      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: projectId
      });

      return true;
    } catch (error) {
      console.error('Firebase initialization error:', error);
      return false;
    }
  }

  // Send notification to single device
  async sendNotification(token, title, body, data = {}) {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    const message = {
      notification: {
        title,
        body
      },
      data,
      token
    };

    return await admin.messaging().send(message);
  }

  // Send bulk notifications
  async sendBulkNotifications(tokens, title, body, data = {}) {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    const message = {
      notification: {
        title,
        body
      },
      data,
      tokens
    };

    return await admin.messaging().sendMulticast(message);
  }

  // Send notification to topic
  async sendTopicNotification(topic, title, body, data = {}) {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    const message = {
      notification: {
        title,
        body
      },
      data,
      topic
    };

    return await admin.messaging().send(message);
  }

  // Subscribe tokens to topic
  async subscribeToTopic(tokens, topic) {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    return await admin.messaging().subscribeToTopic(tokens, topic);
  }

  // Unsubscribe tokens from topic
  async unsubscribeFromTopic(tokens, topic) {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    return await admin.messaging().unsubscribeFromTopic(tokens, topic);
  }

  // Validate device token
  async validateToken(token) {
    if (!this.app) {
      throw new Error('Firebase not initialized');
    }

    try {
      const testMessage = {
        data: {
          test: 'validation'
        },
        token
      };

      await admin.messaging().send(testMessage);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Check if Firebase is initialized
  isInitialized() {
    return this.app !== null;
  }

  // Get app instance
  getApp() {
    return this.app;
  }
}

// Notification templates
const NOTIFICATION_TEMPLATES = {
  WELCOME: {
    title: 'Welcome to 3i SmartHome!',
    body: 'Thanks for joining our smart home management platform!'
  },
  PROJECT_UPDATE: {
    title: 'Project Update',
    body: 'Your project status has been updated'
  },
  TASK_ASSIGNED: {
    title: 'New Task Assigned',
    body: 'You have been assigned a new task'
  },
  PROPOSAL_APPROVED: {
    title: 'Proposal Approved',
    body: 'Your proposal has been approved and is ready for implementation'
  },
  CUSTOMER_ADDED: {
    title: 'New Customer',
    body: 'A new customer has been added to the system'
  },
  REMINDER: {
    title: 'Reminder',
    body: 'You have pending tasks to complete'
  }
};

// Helper function to send templated notifications
async function sendTemplatedNotification(firebaseHelper, token, templateKey, customData = {}) {
  const template = NOTIFICATION_TEMPLATES[templateKey];
  if (!template) {
    throw new Error('Template not found');
  }

  return await firebaseHelper.sendNotification(
    token,
    template.title,
    template.body,
    { template: templateKey, ...customData }
  );
}

module.exports = {
  FirebaseNotificationHelper,
  NOTIFICATION_TEMPLATES,
  sendTemplatedNotification
}; 
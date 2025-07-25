const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      console.log('Firebase Admin SDK already initialized');
      return admin.apps[0];
    }

    // Use service account key from environment variables or file
    let serviceAccount;
    try {
      serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : require('../threeismarthome-firebase-adminsdk-fbsvc-94959b2307.json');
    } catch (error) {
      console.error('Error loading service account:', error);
      throw new Error('Failed to load Firebase service account');
    }

    // Initialize with explicit configuration
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || 'threeismarthome',
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });

    console.log('Firebase Admin SDK initialized successfully');
    console.log('Project ID:', serviceAccount.project_id);
    console.log('Client Email:', serviceAccount.client_email);
    
    return app;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

// Get the initialized admin instance
const getAdmin = () => {
  if (admin.apps.length === 0) {
    initializeFirebase();
  }
  return admin;
};

// Test Firebase messaging functionality
const testMessaging = () => {
  try {
    const adminInstance = getAdmin();
    const messaging = adminInstance.messaging();
    
    console.log('Messaging service available:', !!messaging);
    console.log('Available methods:', Object.getOwnPropertyNames(messaging));
    
    // Test if sendMulticast is available
    if (typeof messaging.sendMulticast === 'function') {
      console.log('✅ sendMulticast function is available');
      return true;
    } else {
      console.log('❌ sendMulticast function is NOT available');
      return false;
    }
  } catch (error) {
    console.error('Error testing messaging:', error);
    return false;
  }
};

module.exports = { initializeFirebase, getAdmin, testMessaging }; 
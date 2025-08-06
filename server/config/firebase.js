const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      return admin.apps[0];
    }

    // Use service account key from individual environment variables
    let serviceAccount;
    try {
      // Check if we have the complete JSON in one env var
      if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      } else {
        // Build service account from individual environment variables
        serviceAccount = {
          type: process.env.FIREBASE_TYPE || "service_account",
          project_id: process.env.FIREBASE_PROJECT_ID,
          private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
          private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          client_id: process.env.FIREBASE_CLIENT_ID,
          auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
          token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
          auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
          client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
          universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || "googleapis.com"
        };
      }

      // Validate required fields
      if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
        throw new Error("Missing required Firebase service account fields");
      }

      console.log('✅ Firebase service account loaded from environment variables');
    } catch (error) {
      console.error("Error loading service account:", error);
      throw new Error("Failed to load Firebase service account from environment variables");
    }

    // Initialize with explicit configuration
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || "threeismarthome",
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    });

    return app;
  } catch (error) {
    console.error("Error initializing Firebase Admin SDK:", error);
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

    // Test if sendMulticast is available
    if (typeof messaging.sendMulticast === "function") {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error testing messaging:", error);
    return false;
  }
};

module.exports = { initializeFirebase, getAdmin, testMessaging };

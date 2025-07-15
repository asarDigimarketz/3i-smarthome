const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware");
const routes = require("./routes");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const admin = require('firebase-admin');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware setup
// 1. Request logging
app.use((req, res, next) => {
  // Save original send method
  const originalSend = res.send;
  res.send = function (body) {
    // After response is sent, log status code, method, and url
    console.log(
      `${new Date().toISOString()} [${req.method}] ${res.statusCode} ${
        req.originalUrl
      }`
    );
    // Call original send
    return originalSend.call(this, body);
  };
  next();
});

// 2. CORS configuration
app.use(
  cors({
    origin: async (origin, callback) => {
      try {
        const mainDomain =
          process.env.NODE_ENV === "production"
            ? `${process.env.FRONTEND_URL}`
            : "http://localhost:3000";

        const allowedOrigins = [mainDomain];

        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"), false);
        }
      } catch (error) {
        console.error("CORS validation error:", error);
        callback(error, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
    exposedHeaders: ["Access-Control-Allow-Origin"],
  })
);

// 3. Body parsing middleware
app.use(express.json({ limit: "10mb" })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 4. Static file serving
app.use(express.static("public"));

// 5. Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// 6. API Key middleware (except for webhook routes)
app.use((req, res, next) => {
  // Skip API key check for all Razorpay related routes
  if (
    // Superadmin Razorpay routes
    req.path.startsWith("/api/razorpay/webhook") ||
    req.path.startsWith("/api/razorpay/create-order") ||
    req.path.startsWith("/api/razorpay/verify-order") ||
    req.path.startsWith("/api/razorpay-keys") ||
    // Hotel-specific Razorpay booking routes
    req.path.match(/^\/api\/[\w-]+\/bookings\/razorpay\/create-order/) ||
    req.path.match(/^\/api\/[\w-]+\/bookings\/razorpay\/verify-payment/) ||
    req.path.match(/^\/api\/[\w-]+\/bookings\/payment-status\/[\w-]+/) ||
    req.path.match(/^\/api\/[\w-]+\/bookings\/payment-link/)
  ) {
    return next();
  }
  apiKeyMiddleware(req, res, next);
});

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

// 7. Routes
// Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "3I Smart Home API is running successfully",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// Register all application routes
app.use(routes);

// Firebase Routes
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
   
    // Check if this is a test/demo token
    const isTestToken = token.startsWith('dGVzdF9') || 
                       token.startsWith('rn_sample_token_') || 
                       token.includes('mock') ||
                       token.length < 140; // Real FCM tokens are typically 140+ characters
   
    if (isTestToken) {
      // Handle test tokens - don't actually send notification
      console.log('Test notification request:', { token: token.substring(0, 20) + '...', title, body });
      return res.json({
        success: true,
        message: 'Test notification processed successfully (demo mode)',
        messageId: 'test_message_' + Date.now(),
        note: 'This was a test token - no actual notification sent'
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
    
    // Provide helpful error messages for common issues
    let errorMessage = 'Failed to send notification';
    
    if (error.code === 'messaging/invalid-argument') {
      errorMessage = 'Invalid FCM token format. Please use a real FCM token from Firebase SDK, not a mock token.';
    } else if (error.code === 'messaging/registration-token-not-registered') {
      errorMessage = 'Token is not registered. The app may have been uninstalled or the token may be expired.';
    } else if (error.code === 'messaging/invalid-registration-token') {
      errorMessage = 'Invalid registration token. Please generate a new token.';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
});

// Get Firebase configuration status
app.get('/api/firebase-status', (req, res) => {
  res.json({
    success: true,
    configured: firebaseApp !== null,
    timestamp: new Date().toISOString()
  });
});

// 8. Error handling middleware
// Handle 404 errors for non-existent routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// 9. Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`📁 Static files: ${path.join(__dirname, "public")}`);
});

// Graceful shutdown handling
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

module.exports = app;

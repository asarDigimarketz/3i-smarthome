const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const apiKeyMiddleware = require("./middleware/apiKeyMiddleware");
const routes = require("./routes");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

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
  console.log(`${new Date().toISOString()} [${req.method}] ${req.originalUrl}`);
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

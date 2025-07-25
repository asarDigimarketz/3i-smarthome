/**
 * Error Handler Middleware
 * Centralized error handling for the application
 * Handles different types of MongoDB and application errors
 */

/**
 * Main error handler middleware
 * Processes different error types and returns appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error("Error:", err);

  // Mongoose bad ObjectId error
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key error (Code 11000)
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // File upload errors
  if (err.code === "LIMIT_FILE_SIZE") {
    const message = "File size too large";
    error = { message, statusCode: 400 };
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    const message = "Too many files uploaded";
    error = { message, statusCode: 400 };
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    const message = "Unexpected field name in file upload";
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  // Permission errors
  if (err.message === "Not authorized to access this route") {
    error = { message: err.message, statusCode: 403 };
  }

  // Default to 500 server error if no specific error type is matched
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * 404 Not Found handler
 * Handles requests to non-existent routes
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Async error handler wrapper
 * Wraps async functions to catch errors and pass them to error middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};

const mongoose = require("mongoose");

/**
 * Connect to MongoDB using the MONGO_URI environment variable
 * Includes proper error handling and connection logging
 */
const connectDB = async () => {
  try {
    // MongoDB connection with recommended options
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });


    // Log database name for debugging
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Exit process with failure code
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;

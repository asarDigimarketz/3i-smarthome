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

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Log database name for debugging
    console.log(`Database Name: ${conn.connection.name}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Exit process with failure code
    process.exit(1);
  }
};

// Handle connection events
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected from MongoDB");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed through app termination");
  process.exit(0);
});

module.exports = connectDB;

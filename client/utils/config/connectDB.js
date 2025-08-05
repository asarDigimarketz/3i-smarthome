import mongoose from "mongoose";

/**
 * Connect to MongoDB using the MONGO_URI environment variable
 * Includes proper error handling and connection reuse
 */
const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connections[0].readyState) {
      return mongoose.connections[0];
    }

    // MongoDB connection with modern options
    const conn = await mongoose.connect(process.env.MONGO_URI);



    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error; // Don't exit process, let the caller handle the error
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

export default connectDB;

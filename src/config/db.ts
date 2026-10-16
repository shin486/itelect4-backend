import mongoose from "mongoose";

// Cache the Mongoose connection promise so a new connection is not created
// on every serverless function invocation.
let connection: Promise<typeof mongoose> | null = null;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (connection) {
    return connection;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing");
  }

  connection = mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  try {
    const conn = await connection;
    const dbName = conn.connection.name || conn.connection.host;
    console.log(`MongoDB connected: ${dbName}`);
    return conn;
  } catch (error) {
    // Reset the cache so a subsequent call can retry connecting.
    connection = null;
    throw error;
  }
};


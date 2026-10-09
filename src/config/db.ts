import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is missing");
  }

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });

  const dbName = conn.connection.name || conn.connection.host;
  console.log(`MongoDB connected: ${dbName}`);
};

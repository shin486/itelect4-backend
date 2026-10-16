import express, { Request, Response } from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import courseRoutes from "./routes/courses.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Database-waiting middleware: ensures MongoDB is connected before any route runs.
// connectDB() is cached, so subsequent invocations reuse the existing connection.
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

// Middlewares - parsed before mounting routes
app.use(cors());
app.use(express.json());

// Base root endpoint
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "ITELECT4 Backend API is running",
    version: "1.0.0",
  });
});

// Health check endpoint conforming to GT4 specs
app.get("/api/health", (_req: Request, res: Response) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    ok: true,
    db: isConnected ? "connected" : "disconnected",
  });
});

// Mount modular API routes
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/courses", courseRoutes);

// 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global 4-argument error handler
app.use(errorHandler);

export default app;

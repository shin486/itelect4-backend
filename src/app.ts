import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base health route
app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    message: "ITELECT4 Backend API is running",
    version: "1.0.0",
    docs: "/api",
  });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// Mount modular API routes
app.use("/api/auth", authRoutes);
app.use("/api/submissions", submissionRoutes);

// 404 handler for unknown routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

export default app;

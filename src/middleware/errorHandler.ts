import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  keyValue?: Record<string, unknown>;
  errors?: Record<string, { message: string }>;
  name: string;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Mongoose validation error -> 400 status with error messages array
  if (err instanceof mongoose.Error.ValidationError || err.name === "ValidationError") {
    const errorMessages = Object.values(err.errors || {}).map((e) => e.message);
    res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: errorMessages,
    });
    return;
  }

  // Mongoose invalid ObjectId (CastError) -> 400 status with invalid ID message
  if (err instanceof mongoose.Error.CastError || err.name === "CastError") {
    res.status(400).json({
      success: false,
      message: "Invalid ID format.",
    });
    return;
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    res.status(409).json({
      success: false,
      message: `Duplicate value entered for ${field}. Please use another value.`,
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
};

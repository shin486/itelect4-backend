import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

interface JwtPayload {
  userId?: string;
  id?: string;
  role?: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      message: "Authentication failed. No token provided or invalid header format.",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    res.status(500).json({
      success: false,
      message: "Server configuration error: JWT_SECRET is not defined.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.userId = decoded.userId || decoded.id;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Authentication failed. Invalid or expired token.",
    });
  }
};


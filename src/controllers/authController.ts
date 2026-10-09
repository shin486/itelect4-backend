import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import type { CreateUser, LoginUser } from "../types/index.js";

const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: userId, userId, role }, secret, {
    expiresIn: "7d",
  });
};

export const register = async (
  req: Request<{}, {}, CreateUser>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide name, email, and password.",
      });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "student",
    });

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<{}, {}, LoginUser>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide both email and password.",
      });
      return;
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

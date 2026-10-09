import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";
import type { CreateSubmission, UpdateSubmission } from "../types/index.js";

export const getSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.query.studentId) {
      filter.studentId = req.query.studentId;
    }
    if (req.query.courseCode) {
      filter.courseCode = String(req.query.courseCode).toUpperCase();
    }
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const submissions = await Submission.find(filter)
      .populate("studentId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionById = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid submission ID format.",
      });
      return;
    }

    const submission = await Submission.findById(id).populate(
      "studentId",
      "name email role"
    );

    if (!submission) {
      res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const createSubmission = async (
  req: Request<{}, {}, CreateSubmission>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in request.",
      });
      return;
    }

    const { courseCode, repoUrl, score, status } = req.body;

    const submission = await Submission.create({
      studentId: new Types.ObjectId(req.userId),
      courseCode,
      repoUrl,
      score,
      status,
      submittedAt: new Date(),
    });

    const populatedSubmission = await submission.populate(
      "studentId",
      "name email role"
    );

    res.status(201).json({
      success: true,
      data: populatedSubmission,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubmission = async (
  req: Request<{ id: string }, {}, UpdateSubmission>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid submission ID format.",
      });
      return;
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
      return;
    }

    // Check ownership or admin/instructor role
    const currentUser = await User.findById(req.userId);
    const isOwner = submission.studentId.toString() === req.userId;
    const isPrivileged =
      currentUser?.role === "admin" || currentUser?.role === "instructor";

    if (!isOwner && !isPrivileged) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to update this submission.",
      });
      return;
    }

    const { courseCode, repoUrl, score, status } = req.body;

    if (courseCode !== undefined) submission.courseCode = courseCode;
    if (repoUrl !== undefined) submission.repoUrl = repoUrl;
    if (score !== undefined) submission.score = score;
    if (status !== undefined) submission.status = status;

    await submission.save();

    const updated = await submission.populate("studentId", "name email role");

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubmission = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid submission ID format.",
      });
      return;
    }

    const submission = await Submission.findById(id);
    if (!submission) {
      res.status(404).json({
        success: false,
        message: "Submission not found.",
      });
      return;
    }

    // Check ownership or admin/instructor role
    const currentUser = await User.findById(req.userId);
    const isOwner = submission.studentId.toString() === req.userId;
    const isPrivileged =
      currentUser?.role === "admin" || currentUser?.role === "instructor";

    if (!isOwner && !isPrivileged) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to delete this submission.",
      });
      return;
    }

    await submission.deleteOne();

    res.status(200).json({
      success: true,
      message: "Submission deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import { Submission } from "../models/Submission.js";

// GET / - Retrieve submissions owned by the authenticated student
export const getSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const submissions = await Submission.find({ studentId: req.userId })
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

// GET /:id - Retrieve single submission scoped to the owner
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

    const submission = await Submission.findOne({
      _id: id,
      studentId: req.userId,
    }).populate("studentId", "name email role");

    if (!submission) {
      res.status(404).json({
        success: false,
        message: "Submission not found or unauthorized.",
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

// POST / - Create a new submission ensuring owner is req.userId (cannot be spoofed)
export const createSubmission = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Explicitly set studentId to req.userId AFTER spreading req.body so body input cannot spoof ownership
    const submission = await Submission.create({
      ...req.body,
      studentId: req.userId,
    });

    const populated = await submission.populate("studentId", "name email role");

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /:id - Update submission scoped to owner using findOneAndUpdate with runValidators
export const updateSubmission = async (
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

    const submission = await Submission.findOneAndUpdate(
      { _id: id, studentId: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate("studentId", "name email role");

    if (!submission) {
      res.status(404).json({
        success: false,
        message: "Submission not found or unauthorized.",
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

// DELETE /:id - Delete submission scoped to owner using findOneAndDelete and 204 status
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

    const submission = await Submission.findOneAndDelete({
      _id: id,
      studentId: req.userId,
    });

    if (!submission) {
      res.status(404).json({
        success: false,
        message: "Submission not found or unauthorized.",
      });
      return;
    }

    // Answers 204 with .send() (no body) on success
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

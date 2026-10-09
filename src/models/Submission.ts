import { Schema, model } from "mongoose";
import type { SubmissionDoc } from "../types/index.js";

const submissionSchema = new Schema<SubmissionDoc>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Student reference is required"],
    },
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      trim: true,
      uppercase: true,
    },
    repoUrl: {
      type: String,
      required: [true, "Repository URL is required"],
      trim: true,
      match: [
        /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/,
        "Must be a valid GitHub repository URL (https://github.com/owner/repo)",
      ],
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    score: {
      type: Number,
      min: [0, "Score cannot be less than 0"],
      max: [100, "Score cannot exceed 100"],
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "submitted", "graded", "late"],
        message: "{VALUE} is not a valid submission status",
      },
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

// Configure toJSON transform to rename _id to id and delete _id and __v
submissionSchema.set("toJSON", {
  transform(_doc, ret: any) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Submission = model<SubmissionDoc>("Submission", submissionSchema);

import { Schema, model } from "mongoose";
import type { CourseDoc } from "../types/index.js";

const courseSchema = new Schema<CourseDoc>(
  {
    code: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    units: {
      type: Number,
      required: [true, "Units is required"],
      min: [1, "Units must be at least 1"],
      max: [6, "Units cannot exceed 6"],
    },
    semester: {
      type: String,
      required: [true, "Semester is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Configure toJSON transform to map id = String(ret._id) and strip _id/__v
courseSchema.set("toJSON", {
  transform(_doc, ret: any) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export const Course = model<CourseDoc>("Course", courseSchema);

import mongoose from "mongoose";
import { Course } from "./models/Course.js";
import { connectDB } from "./config/db.js";
import { courses } from "./data/courses.js";

async function seed(): Promise<void> {
  try {
    await connectDB();

    for (const course of courses) {
      await Course.updateOne({ code: course.code }, course, { upsert: true });
    }

    console.log("Seed complete: courses upserted.");
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();

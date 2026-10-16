import { Router } from "express";
import { Course } from "../models/Course.js";

const router = Router();

// GET /api/courses - Return all courses
router.get("/", async (_req, res) => {
  const courses = await Course.find().sort({ code: 1 });
  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

// GET /api/courses/:code - Return a single course matching the case-insensitive code
router.get("/:code", async (req, res) => {
  const course = await Course.findOne({
    code: { $regex: new RegExp(`^${req.params.code}$`, "i") },
  });

  if (!course) {
    res.status(404).json({
      success: false,
      message: "Course not found.",
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

export default router;

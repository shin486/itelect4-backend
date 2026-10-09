import { Router } from "express";
import {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
} from "../controllers/submissionController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Public routes for reading submissions
router.get("/", getSubmissions);
router.get("/:id", getSubmissionById);

// Protected routes requiring authentication
router.post("/", authenticate, createSubmission);
router.put("/:id", authenticate, updateSubmission);
router.patch("/:id", authenticate, updateSubmission);
router.delete("/:id", authenticate, deleteSubmission);

export default router;

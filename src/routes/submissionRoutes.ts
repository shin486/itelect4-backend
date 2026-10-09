import { Router } from "express";
import {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  deleteSubmission,
} from "../controllers/submissionController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Protect all submission endpoints with requireAuth for complete tenant isolation
router.use(requireAuth);

router.get("/", getSubmissions);
router.get("/:id", getSubmissionById);
router.post("/", createSubmission);
router.patch("/:id", updateSubmission);
router.put("/:id", updateSubmission);
router.delete("/:id", deleteSubmission);

export default router;

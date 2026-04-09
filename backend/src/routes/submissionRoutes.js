import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getSubmissions,
  createSubmission,
  updateSubmissionStatus,
  deleteSubmission
} from "../controllers/submissionController.js";

const router = express.Router();

// Public route — chatbot widget can submit forms without auth
router.post("/", createSubmission);

// Protected routes — dashboard only
router.use(protect);
router.get("/", getSubmissions);
router.patch("/:id/status", updateSubmissionStatus);
router.delete("/:id", deleteSubmission);

export default router;

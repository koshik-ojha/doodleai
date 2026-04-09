import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getStats } from "../controllers/dashboardController.js";

const router = express.Router();
router.use(protect);
router.get("/stats", getStats);

export default router;

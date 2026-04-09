import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getSettings, updateSettings, getPublicSettings } from "../controllers/settingsController.js";

const router = express.Router();

router.get("/public/:userId", getPublicSettings);

router.use(protect);
router.get("/", getSettings);
router.put("/", updateSettings);

export default router;

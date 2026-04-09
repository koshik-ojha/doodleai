import express from "express";
import { login, register, getProfile, updateProfile, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, changePassword);

export default router;

import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getUsers } from "../controllers/userController.js";

const router = express.Router();
router.use(protect, adminOnly);
router.get("/", getUsers);

export default router;

import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getUsers, getAllChatbots, suspendUser, reactivateUser, updateChatbotLimit, updateIconPermission,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/users", getUsers);
router.get("/chatbots", getAllChatbots);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/reactivate", reactivateUser);
router.patch("/users/:id/chatbot-limit", updateChatbotLimit);
router.patch("/users/:id/icon-permission", updateIconPermission);

export default router;

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getChatbots, createChatbot, getChatbot, updateChatbot, deleteChatbot, getPublicChatbot } from "../controllers/chatbotController.js";

const router = express.Router();

router.get("/public/:id", getPublicChatbot);

router.use(protect);
router.get("/", getChatbots);
router.post("/", createChatbot);
router.get("/:id", getChatbot);
router.put("/:id", updateChatbot);
router.delete("/:id", deleteChatbot);

export default router;

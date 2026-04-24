import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkChatbotLimit } from "../middleware/subscriptionMiddleware.js";
import { getChatbots, createChatbot, getChatbot, updateChatbot, deleteChatbot, getPublicChatbot, crawlChatbotSite, clearCrawledData, getEmbedToken } from "../controllers/chatbotController.js";

const router = express.Router();

router.get("/public/:id", getPublicChatbot);

router.use(protect);
router.get("/", getChatbots);
router.post("/", checkChatbotLimit, createChatbot);
router.get("/:id", getChatbot);
router.put("/:id", updateChatbot);
router.delete("/:id", deleteChatbot);
router.post("/:id/crawl", crawlChatbotSite);
router.delete("/:id/crawl-data", clearCrawledData);
router.get("/:id/embed-token", getEmbedToken);

export default router;

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createChat,
  getChats,
  getMessages,
  renameChat,
  deleteChat,
  sendMessage
} from "../controllers/chatController.js";

const router = express.Router();

router.use(protect);
router.get("/", getChats);
router.post("/", createChat);
router.get("/:chatId/messages", getMessages);
router.post("/:chatId/messages", sendMessage);
router.put("/:chatId", renameChat);
router.delete("/:chatId", deleteChat);

export default router;

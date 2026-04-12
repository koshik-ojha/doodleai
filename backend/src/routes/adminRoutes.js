import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  getUsers, getAllChatbots, suspendUser, reactivateUser,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/users", getUsers);
router.get("/chatbots", getAllChatbots);
router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/reactivate", reactivateUser);

export default router;

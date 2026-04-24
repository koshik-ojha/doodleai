import express from "express";
import {
  createSubscription,
  verifySubscription,
  getMySubscription,
  cancelSubscription,
  handleWebhook,
} from "../controllers/subscriptionController.js";
import { protectAllowTrial } from "../middleware/authMiddleware.js";

const router = express.Router();

// Webhook must use raw body — registered in server.js with express.raw() before this router
router.post("/webhook", handleWebhook);

router.get("/me", protectAllowTrial, getMySubscription);
router.post("/create", protectAllowTrial, createSubscription);
router.post("/verify", protectAllowTrial, verifySubscription);
router.post("/cancel", protectAllowTrial, cancelSubscription);

export default router;

import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { protectAllowTrial } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", protectAllowTrial, createOrder);
router.post("/verify-payment", protectAllowTrial, verifyPayment);

export default router;

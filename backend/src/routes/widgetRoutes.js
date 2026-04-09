import express from "express";
import { widgetMessage } from "../controllers/widgetController.js";

const router = express.Router();
router.post("/message", widgetMessage);

export default router;

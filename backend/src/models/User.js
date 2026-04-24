import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  company: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isSuspended: { type: Boolean, default: false },
  suspendedForPayment: { type: Boolean, default: false }, // true = trial/subscription ended; false = admin action
  adminActivated: { type: Boolean, default: false },
  canChangeIcon: { type: Boolean, default: false },
  extraChatbotAllocation: { type: Number, default: 0, min: 0 }, // Extra chatbots beyond plan limit (admin override)
}, { timestamps: true });

export default mongoose.model("User", userSchema);

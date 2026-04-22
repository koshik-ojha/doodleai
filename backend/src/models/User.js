import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  company: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isSuspended: { type: Boolean, default: false },
  adminActivated: { type: Boolean, default: false },
  canChangeIcon: { type: Boolean, default: false },
  maxChatbots: { type: Number, default: 1, min: 0 },
}, { timestamps: true });

export default mongoose.model("User", userSchema);

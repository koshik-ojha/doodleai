import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  type: { type: String, enum: ["register", "reset"], default: "register" },
  userData: { type: Object, default: null }, // only used for register
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto-delete after 10 min
});

export default mongoose.model("Otp", otpSchema);

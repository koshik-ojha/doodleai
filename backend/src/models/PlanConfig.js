import mongoose from "mongoose";

const planConfigSchema = new mongoose.Schema({
  planKey:        { type: String, required: true, unique: true },
  razorpayPlanId: { type: String, required: true },
  amount:         { type: Number, required: true },
  period:         { type: String, required: true },
  chatbotLimit:   { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model("PlanConfig", planConfigSchema);

import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
  userId:                  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  razorpaySubscriptionId:  { type: String, required: true },
  razorpayPlanId:          { type: String, required: true },
  planName:                { type: String, required: true },
  planKey:                 { type: String, enum: ["starter", "growth", "professional"], required: true },
  billing:                 { type: String, enum: ["monthly", "yearly"], required: true },
  status: {
    type: String,
    enum: ["created", "authenticated", "active", "pending", "halted", "cancelled", "completed", "expired"],
    default: "created",
  },
  chatbotLimit:            { type: Number, required: true },
  amount:                  { type: Number, required: true },
  currentStart:            { type: Date },
  currentEnd:              { type: Date },
  nextBillingDate:         { type: Date },
  pendingSuspension:       { type: Boolean, default: false },
  suspensionDate:          { type: Date },
  chargeCount:             { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model("Subscription", subscriptionSchema);

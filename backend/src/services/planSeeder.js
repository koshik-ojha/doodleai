import Razorpay from "razorpay";
import PlanConfig from "../models/PlanConfig.js";
import { PLANS } from "../config/plans.js";

export async function seedPlans() {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  for (const [key, plan] of Object.entries(PLANS)) {
    const existing = await PlanConfig.findOne({ planKey: key });
    if (existing) continue;

    try {
      const rzpPlan = await razorpay.plans.create({
        period: plan.period,
        interval: 1,
        item: {
          name: plan.name,
          amount: plan.amount,
          currency: "INR",
          description: `DoodleAI ${plan.name}`,
        },
        notes: { planKey: key },
      });

      await PlanConfig.create({
        planKey: key,
        razorpayPlanId: rzpPlan.id,
        amount: plan.amount,
        period: plan.period,
        chatbotLimit: plan.chatbotLimit,
      });

      console.log(`Plan seeded: ${key} → ${rzpPlan.id}`);
    } catch (err) {
      console.error(`Failed to seed plan ${key}:`, err.message);
    }
  }
}

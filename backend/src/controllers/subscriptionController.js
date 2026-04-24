import Razorpay from "razorpay";
import crypto from "crypto";
import Subscription from "../models/Subscription.js";
import PlanConfig from "../models/PlanConfig.js";
import User from "../models/User.js";
import { PLANS } from "../config/plans.js";
import { clearSuspensionCache } from "../middleware/authMiddleware.js";

let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

// POST /api/subscriptions/create
export const createSubscription = async (req, res) => {
  try {
    const { planKey, billing } = req.body;
    const fullKey = `${planKey}_${billing}`;

    const planConfig = await PlanConfig.findOne({ planKey: fullKey });
    if (!planConfig) return res.status(400).json({ error: "Invalid plan selected" });

    // "created" means the user opened the modal but never paid — allow overwriting it.
    // Block only if they've already authenticated/activated a subscription.
    const existing = await Subscription.findOne({
      userId: req.user.id,
      status: { $in: ["authenticated", "active", "pending"] },
    });
    if (existing) return res.status(400).json({ error: "You already have an active subscription. Cancel it first to switch plans." });

    const totalCount = billing === "yearly" ? 10 : 120;

    const rzpSub = await getRazorpay().subscriptions.create({
      plan_id: planConfig.razorpayPlanId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: 1,
    });

    const planDetails = PLANS[fullKey];

    // Upsert: replace any old expired/cancelled sub for this user
    await Subscription.findOneAndUpdate(
      { userId: req.user.id },
      {
        userId: req.user.id,
        razorpaySubscriptionId: rzpSub.id,
        razorpayPlanId: planConfig.razorpayPlanId,
        planName: planDetails.name,
        planKey,
        billing,
        status: rzpSub.status,
        chatbotLimit: planDetails.chatbotLimit,
        amount: planDetails.amount,
        pendingSuspension: false,
        suspensionDate: null,
        currentStart: null,
        currentEnd: null,
        nextBillingDate: null,
        chargeCount: 0,
      },
      { upsert: true, new: true }
    );

    res.json({ subscriptionId: rzpSub.id });
  } catch (err) {
    console.error("Create subscription error:", err.error || err.message);
    res.status(500).json({ error: err.error?.description || "Failed to create subscription" });
  }
};

// POST /api/subscriptions/verify
export const verifySubscription = async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_subscription_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    const expectedSig = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
      .digest("hex");

    if (expectedSig !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    await Subscription.findOneAndUpdate(
      { razorpaySubscriptionId: razorpay_subscription_id },
      { status: "authenticated" }
    );

    res.json({ success: true, message: "Subscription authenticated successfully" });
  } catch (err) {
    console.error("Verify subscription error:", err.message);
    res.status(500).json({ error: "Verification failed" });
  }
};

// GET /api/subscriptions/me
export const getMySubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(sub || null);
  } catch (err) {
    console.error("Get subscription error:", err.message);
    res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

// POST /api/subscriptions/cancel
export const cancelSubscription = async (req, res) => {
  try {
    const sub = await Subscription.findOne({
      userId: req.user.id,
      status: { $in: ["active", "authenticated"] },
    });
    if (!sub) return res.status(404).json({ error: "No active subscription found to cancel" });

    // cancelAtCycleEnd=true for active (user keeps access until period end);
    // false for authenticated (no billing period started yet, cancel immediately)
    const cancelAtCycleEnd = sub.status === "active";
    await getRazorpay().subscriptions.cancel(sub.razorpaySubscriptionId, cancelAtCycleEnd);

    // For authenticated subs currentEnd is null — suspend immediately
    const suspensionDate = sub.currentEnd || new Date();

    await Subscription.findByIdAndUpdate(sub._id, {
      status: "cancelled",
      pendingSuspension: true,
      suspensionDate,
    });

    res.json({ success: true, suspensionDate });
  } catch (err) {
    console.error("Cancel subscription error:", err.error || err.message);
    res.status(500).json({ error: err.error?.description || "Failed to cancel subscription" });
  }
};

// POST /api/subscriptions/webhook  (raw body — verified by signature)
export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSig = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)        // req.body is a Buffer here (raw middleware)
      .digest("hex");

    if (expectedSig !== signature) {
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const event = JSON.parse(req.body.toString());
    const subEntity = event.payload?.subscription?.entity;
    if (!subEntity) return res.json({ ok: true });

    const rzpSubId = subEntity.id;

    switch (event.event) {
      case "subscription.activated": {
        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: rzpSubId },
          {
            status: "active",
            currentStart: subEntity.current_start ? new Date(subEntity.current_start * 1000) : null,
            currentEnd: subEntity.current_end ? new Date(subEntity.current_end * 1000) : null,
            nextBillingDate: subEntity.charge_at ? new Date(subEntity.charge_at * 1000) : null,
          },
          { new: true }
        );
        if (sub) {
          // adminActivated: true lifts the 14-day trial block for users who just subscribed
          await User.findByIdAndUpdate(sub.userId, {
            isSuspended: false,
            suspendedForPayment: false,
            adminActivated: true,
            maxChatbots: sub.chatbotLimit,
          });
          clearSuspensionCache(String(sub.userId));
        }
        break;
      }

      case "subscription.charged": {
        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: rzpSubId },
          {
            status: "active",
            currentStart: subEntity.current_start ? new Date(subEntity.current_start * 1000) : null,
            currentEnd: subEntity.current_end ? new Date(subEntity.current_end * 1000) : null,
            nextBillingDate: subEntity.charge_at ? new Date(subEntity.charge_at * 1000) : null,
            pendingSuspension: false,
            suspensionDate: null,
            $inc: { chargeCount: 1 },
          },
          { new: true }
        );
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, {
            isSuspended: false,
            suspendedForPayment: false,
            adminActivated: true,
            maxChatbots: sub.chatbotLimit,
          });
          clearSuspensionCache(String(sub.userId));
        }
        break;
      }

      case "subscription.cancelled": {
        const suspensionDate = subEntity.current_end
          ? new Date(subEntity.current_end * 1000)
          : new Date();

        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: rzpSubId },
          { status: "cancelled", pendingSuspension: true, suspensionDate }
        );
        break;
      }

      case "subscription.completed": {
        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: rzpSubId },
          { status: "completed", pendingSuspension: false }
        );
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, { isSuspended: true, suspendedForPayment: true });
          clearSuspensionCache(String(sub.userId));
        }
        break;
      }

      case "subscription.halted": {
        const sub = await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: rzpSubId },
          { status: "halted" }
        );
        if (sub) {
          await User.findByIdAndUpdate(sub.userId, { isSuspended: true, suspendedForPayment: true });
          clearSuspensionCache(String(sub.userId));
        }
        break;
      }
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

import jwt from "jsonwebtoken";
import User from "../models/User.js";

const suspensionCache = new Map();
const CACHE_TTL = 30_000;
const TRIAL_MS = 14 * 24 * 60 * 60 * 1000;

const isTrialExpired = (user) =>
  user.role === "user" && !user.adminActivated &&
  Date.now() > new Date(user.createdAt).getTime() + TRIAL_MS;

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorized" });
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = String(decoded.id);
    const now = Date.now();

    const cached = suspensionCache.get(userId);
    if (cached && cached.expiresAt > now) {
      if (cached.suspended) {
        return res.status(403).json({
          error: cached.paymentSuspended
            ? "Your subscription has expired. Please subscribe to continue."
            : "Your account has been suspended. Please contact support.",
          suspended: true,
          paymentSuspended: !!cached.paymentSuspended,
        });
      }
      if (cached.trialExpired) {
        return res.status(403).json({
          error: "Your free trial has ended. Please subscribe to continue.",
          suspended: true,
          trialExpired: true,
        });
      }
      req.user = decoded;
      return next();
    }

    const user = await User.findById(userId).select("isSuspended suspendedForPayment role adminActivated createdAt");
    if (!user) return res.status(401).json({ error: "User not found" });

    const trialExpired = isTrialExpired(user);
    suspensionCache.set(userId, {
      suspended: !!user.isSuspended,
      paymentSuspended: !!user.suspendedForPayment,
      trialExpired,
      expiresAt: now + CACHE_TTL,
    });

    if (user.isSuspended) {
      return res.status(403).json({
        error: user.suspendedForPayment
          ? "Your subscription has expired. Please subscribe to continue."
          : "Your account has been suspended. Please contact support.",
        suspended: true,
        paymentSuspended: !!user.suspendedForPayment,
      });
    }

    if (trialExpired) {
      return res.status(403).json({
        error: "Your free trial has ended. Please subscribe to continue.",
        suspended: true,
        trialExpired: true,
      });
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Same as protect but skips trial-expiry block — used on payment routes so
// trial-expired users can still complete a purchase to reactivate their account.
// Skips trial-expiry and payment-suspension checks so users can reach
// billing/subscription routes even after their account is suspended for non-payment.
// Still blocks admin-suspended accounts (suspendedForPayment = false).
export const protectAllowTrial = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Not authorized" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = String(decoded.id);

    const user = await User.findById(userId).select("isSuspended suspendedForPayment");
    if (!user) return res.status(401).json({ error: "User not found" });

    // Only block if suspended by an admin (not trial/subscription expiry)
    if (user.isSuspended && !user.suspendedForPayment) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact support.", suspended: true });
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const clearSuspensionCache = (userId) => {
  suspensionCache.delete(String(userId));
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

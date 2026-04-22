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
          error: "Your account has been suspended. Please contact support.",
          suspended: true,
        });
      }
      if (cached.trialExpired) {
        return res.status(403).json({
          error: "Your free trial of 14 days has expired. Please contact admin.",
          suspended: true,
          trialExpired: true,
        });
      }
      req.user = decoded;
      return next();
    }

    const user = await User.findById(userId).select("isSuspended role adminActivated createdAt");
    if (!user) return res.status(401).json({ error: "User not found" });

    const trialExpired = isTrialExpired(user);
    suspensionCache.set(userId, {
      suspended: !!user.isSuspended,
      trialExpired,
      expiresAt: now + CACHE_TTL,
    });

    if (user.isSuspended) {
      return res.status(403).json({
        error: "Your account has been suspended. Please contact support.",
        suspended: true,
      });
    }

    if (trialExpired) {
      return res.status(403).json({
        error: "Your free trial of 14 days has expired. Please contact admin.",
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

export const clearSuspensionCache = (userId) => {
  suspensionCache.delete(String(userId));
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

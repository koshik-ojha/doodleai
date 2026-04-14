import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Cache suspension status per user for 30 seconds to avoid a DB hit on every request
const suspensionCache = new Map(); // userId -> { suspended: boolean, expiresAt: number }
const CACHE_TTL = 30_000;

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

    // Serve from cache when still fresh
    const cached = suspensionCache.get(userId);
    if (cached && cached.expiresAt > now) {
      if (cached.suspended) {
        return res.status(403).json({
          error: "Your account has been suspended. Please contact support.",
          suspended: true,
        });
      }
      req.user = decoded;
      return next();
    }

    // Cache miss — query DB and populate cache
    const user = await User.findById(userId).select("isSuspended");
    if (!user) return res.status(401).json({ error: "User not found" });

    suspensionCache.set(userId, { suspended: !!user.isSuspended, expiresAt: now + CACHE_TTL });

    if (user.isSuspended) {
      return res.status(403).json({
        error: "Your account has been suspended. Please contact support.",
        suspended: true,
      });
    }

    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Call this when a user is reactivated so the cache doesn't keep them blocked
export const clearSuspensionCache = (userId) => {
  suspensionCache.delete(String(userId));
};

export const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

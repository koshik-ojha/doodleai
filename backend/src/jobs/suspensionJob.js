import cron from "node-cron";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import { clearSuspensionCache } from "../middleware/authMiddleware.js";

export function startSuspensionJob() {
  // Runs daily at midnight
  cron.schedule("0 0 * * *", async () => {
    try {
      const now = new Date();
      const due = await Subscription.find({
        pendingSuspension: true,
        suspensionDate: { $lte: now },
        status: "cancelled",
      });

      for (const sub of due) {
        await User.findByIdAndUpdate(sub.userId, { isSuspended: true, suspendedForPayment: true });
        await Subscription.findByIdAndUpdate(sub._id, {
          pendingSuspension: false,
          status: "expired",
        });
        clearSuspensionCache(String(sub.userId));
        console.log(`Suspended user ${sub.userId} — ${sub.planKey} plan expired`);
      }

      if (due.length) console.log(`Suspension job: processed ${due.length} account(s)`);
    } catch (err) {
      console.error("Suspension job error:", err.message);
    }
  });
}

import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const getRangeDate = (range) => {
  const days =
    range === "24hours" ? 1 : range === "30days" ? 30 : range === "90days" ? 90 : 7;
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - days);
  return { from, days, now };
};

const calcTrend = (curr, prev) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
};

export const getAnalytics = async (req, res) => {
  try {
    const { range = "7days" } = req.query;
    const { from, days } = getRangeDate(range);

    // ── Previous period (same duration, immediately before current) ──
    const prevFrom = new Date(from);
    prevFrom.setDate(prevFrom.getDate() - days);

    // ── Daily activity: chats created per day ──
    const dailyChats = await Chat.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          conversations: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyMap = {};
    dailyChats.forEach((d) => { dailyMap[d._id] = d.conversations; });

    const dailyActivity = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label =
        days === 1
          ? `${String(d.getHours()).padStart(2, "0")}:00`
          : d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      dailyActivity.push({ day: label, date: key, conversations: dailyMap[key] || 0 });
    }

    // ── Hourly activity for heatmap (day-of-week × hour) ──
    // $dayOfWeek: 1=Sun … 7=Sat  →  we remap to 0=Mon … 6=Sun
    const hourlyRaw = await Message.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: {
            dayOfWeek: { $dayOfWeek: "$createdAt" },
            hour: { $hour: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    // Build nested map: { dayIdx: { hour: count } }
    const hourlyActivity = {};
    hourlyRaw.forEach(({ _id: { dayOfWeek, hour }, count }) => {
      const dayIdx = (dayOfWeek + 5) % 7; // 0=Mon … 6=Sun
      if (!hourlyActivity[dayIdx]) hourlyActivity[dayIdx] = {};
      hourlyActivity[dayIdx][hour] = (hourlyActivity[dayIdx][hour] || 0) + count;
    });

    // ── Top chats by message count ──
    const topChatsAgg = await Message.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: { _id: "$chatId", messageCount: { $sum: 1 } } },
      { $sort: { messageCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "chats",
          localField: "_id",
          foreignField: "_id",
          as: "chat",
        },
      },
      { $unwind: "$chat" },
      { $project: { _id: 0, question: "$chat.title", count: "$messageCount" } },
    ]);

    // ── Current period counts ──
    const [
      totalChats,
      userMessages,
      assistantMessages,
      uniqueUsers,
      newUsers,
    ] = await Promise.all([
      Chat.countDocuments({ createdAt: { $gte: from } }),
      Message.countDocuments({ role: "user", createdAt: { $gte: from } }),
      Message.countDocuments({ role: "assistant", createdAt: { $gte: from } }),
      Chat.distinct("userId", { createdAt: { $gte: from } }),
      User.countDocuments({ createdAt: { $gte: from } }),
    ]);

    // ── Previous period counts (for trends) ──
    const [prevChats, prevMessages, prevNewUsers] = await Promise.all([
      Chat.countDocuments({ createdAt: { $gte: prevFrom, $lt: from } }),
      Message.countDocuments({ role: "user", createdAt: { $gte: prevFrom, $lt: from } }),
      User.countDocuments({ createdAt: { $gte: prevFrom, $lt: from } }),
    ]);

    const aiCompletionRate =
      userMessages > 0 ? Math.round((assistantMessages / userMessages) * 100) : 100;

    const avgMessagesPerChat = totalChats > 0 ? Math.round(userMessages / totalChats) : 0;

    res.json({
      dailyActivity,
      hourlyActivity,
      topChats: topChatsAgg,
      totalChats,
      totalMessages: userMessages,
      uniqueUsers: uniqueUsers.length,
      newUsers,
      avgMessagesPerChat,
      aiCompletionRate: `${aiCompletionRate}%`,
      trends: {
        chats: calcTrend(totalChats, prevChats),
        messages: calcTrend(userMessages, prevMessages),
        users: calcTrend(newUsers, prevNewUsers),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

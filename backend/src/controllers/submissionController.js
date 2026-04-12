import Submission from "../models/Submission.js";
import Chatbot from "../models/Chatbot.js";
import Settings from "../models/Settings.js";

const sendTelegramNotification = async (chatId, botToken, submission, botName) => {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;
  const text =
    `<b>New Lead Received!</b>\n\n` +
    `<b>Name:</b> ${submission.name}\n` +
    `<b>Email:</b> ${submission.email}\n` +
    `<b>Phone:</b> ${submission.phone || "N/A"}\n` +
    `<b>Company:</b> ${submission.company || "N/A"}\n` +
    `<b>Type:</b> ${submission.formType}\n` +
    (submission.message ? `<b>Message:</b> ${submission.message}\n` : "") +
    (submission.budget ? `<b>Budget:</b> ${submission.budget}\n` : "") +
    `<b>Bot:</b> ${botName || "N/A"}`;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    });
  } catch {
    // Telegram failure should never block the submission
  }
};

export const getSubmissions = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const query = isAdmin ? {} : { userId: req.user.id };
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 15);
    const skip = (page - 1) * limit;

    const [submissions, total] = await Promise.all([
      Submission.find(query)
        .populate(isAdmin ? { path: "userId", select: "name email" } : "")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Submission.countDocuments(query),
    ]);

    res.json({ submissions, total, page, hasMore: skip + submissions.length < total });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

export const createSubmission = async (req, res) => {
  try {
    const {
      name, email, phone, company, subject, message, botId,
      formType = "contact", budget, preferredDate, preferredTime, topic,
    } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    let userId = null;
    let botName = "";
    if (botId) {
      const chatbot = await Chatbot.findById(botId).catch(() => null);
      if (chatbot) {
        userId = chatbot.userId;
        botName = chatbot.name || chatbot.botName || "";
      }
    }

    const submission = await Submission.create({
      name, email, phone, company,
      subject: subject || formType,
      message: message || "",
      formType,
      budget, preferredDate, preferredTime, topic,
      botId: botId || undefined,
      userId,
      botName,
    });

    // Send Telegram notification if user has configured a Chat ID
    if (userId) {
      const userSettings = await Settings.findOne({ userId }).catch(() => null);
      if (userSettings?.telegramChatId) {
        sendTelegramNotification(userSettings.telegramChatId, userSettings.telegramBotToken, submission, botName);
      }
    }

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: "Failed to create submission" });
  }
};

export const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const isAdmin = req.user.role === "admin";
    const filter = isAdmin ? { _id: id } : { _id: id, userId: req.user.id };
    const submission = await Submission.findOneAndUpdate(filter, { $set: { status } }, { new: true });
    if (!submission) return res.status(404).json({ error: "Submission not found" });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Failed to update submission" });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const filter = isAdmin ? { _id: req.params.id } : { _id: req.params.id, userId: req.user.id };
    await Submission.findOneAndDelete(filter);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete submission" });
  }
};

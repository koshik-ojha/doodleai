import Submission from "../models/Submission.js";
import Chatbot from "../models/Chatbot.js";

export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(submissions);
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
    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ error: "Failed to create submission" });
  }
};

export const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const submission = await Submission.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { status },
      { new: true }
    );
    if (!submission) return res.status(404).json({ error: "Submission not found" });
    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Failed to update submission" });
  }
};

export const deleteSubmission = async (req, res) => {
  try {
    await Submission.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete submission" });
  }
};

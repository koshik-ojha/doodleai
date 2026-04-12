import Settings from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user.id });
    if (!settings) {
      settings = await Settings.create({ userId: req.user.id });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const allowed = [
      "botName", "welcomeMessage", "responseDelay", "language",
      "position", "primaryColor", "autoOpen",
      "emailNotifications", "chatAlerts", "weeklyReports", "sessionTimeout"
    ];
    const updates = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const settings = await Settings.findOneAndUpdate(
      { userId: req.user.id },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Failed to update settings" });
  }
};

// Public endpoint — widget reads bot config by userId (embed key)
export const getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ userId: req.params.userId }).select(
      "botName welcomeMessage primaryColor position autoOpen"
    );
    if (!settings) return res.status(404).json({ error: "Not found" });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch public settings" });
  }
};

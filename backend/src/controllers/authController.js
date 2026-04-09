import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const createToken = (user) => jwt.sign(
  { id: user._id, email: user.email, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      success: true,
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, company } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (company !== undefined) updates.company = company;
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existing) return res.status(400).json({ error: "Email already in use" });
      updates.email = email;
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    const token = createToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Both passwords required" });
    }
    const user = await User.findById(req.user.id);
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ error: "Current password is incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    res.json({
      success: true,
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};

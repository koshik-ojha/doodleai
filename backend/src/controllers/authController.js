import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { isTempEmail } from "../utils/tempMailDomains.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../services/emailService.js";

const createToken = (user) => jwt.sign(
  { id: user._id, email: user.email, name: user.name, role: user.role || "user" },
  process.env.JWT_SECRET,
  { expiresIn: "7d" }
);

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

    // Block disposable/temp emails
    if (isTempEmail(email)) {
      return res.status(400).json({ error: "Temporary or disposable email addresses are not allowed. Please use a real email." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email already registered" });

    // OTP verification temporarily disabled
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });

    res.status(201).json({
      success: true,
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role || "user" },
    });
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ error: "OTP expired or not found. Please register again." });

    if (record.otp !== String(otp).trim()) {
      return res.status(400).json({ error: "Invalid OTP. Please check and try again." });
    }

    // Create the user now
    const { name, password } = record.userData;
    const user = await User.create({ name, email, password });

    // Clean up OTP
    await Otp.deleteMany({ email });

    res.status(201).json({
      success: true,
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role || "user" },
    });
  } catch (error) {
    console.error("OTP verify error:", error.message);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const record = await Otp.findOne({ email });
    if (!record) return res.status(400).json({ error: "No pending registration for this email." });

    const otp = generateOtp();
    record.otp = otp;
    record.createdAt = new Date();
    await record.save();

    await sendOtpEmail(email, otp, record.userData.name);

    res.json({ success: true });
  } catch (error) {
    console.error("Resend OTP error:", error.message);
    res.status(500).json({ error: "Failed to resend OTP" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email });
    // Always respond the same way to prevent email enumeration
    if (!user) return res.json({ success: true });

    const otp = generateOtp();
    await Otp.deleteMany({ email, type: "reset" });
    await Otp.create({ email, otp, type: "reset" });
    await sendPasswordResetEmail(email, otp);

    res.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error.message);
    res.status(500).json({ error: "Failed to send reset code. Please try again." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: "All fields required" });
    if (newPassword.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const record = await Otp.findOne({ email, type: "reset" });
    if (!record) return res.status(400).json({ error: "OTP expired or not found. Please request a new one." });
    if (record.otp !== String(otp).trim()) return res.status(400).json({ error: "Invalid OTP. Please check and try again." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { $set: { password: hashed } });
    await Otp.deleteMany({ email, type: "reset" });

    res.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error.message);
    res.status(500).json({ error: "Failed to reset password. Please try again." });
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

    if (user.isSuspended) {
      return res.status(403).json({ error: "Your account has been suspended. Please contact support." });
    }

    res.json({
      success: true,
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email, role: user.role || "user" },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ error: "Login failed" });
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

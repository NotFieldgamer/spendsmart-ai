import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendResetEmail } from "../utils/sendEmail.js";

const makeToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: "Email already used" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  const token = makeToken(user._id);

  res.status(201).json({
    token,
    user: { id: user._id, name: user.name, email: user.email }
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = makeToken(user._id);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
};


/* FORGOT PASSWORD */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "If account exists, email sent" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  user.resetPasswordToken = token;
  user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
  await user.save();

  const link = `http://localhost:5173/reset-password/${token}`;

  await sendResetEmail({
    to: email,
    subject: "Reset your SpendSmart password",
    html: `
      <p>Click below to reset password:</p>
      <a href="${link}">${link}</a>
    `,
  });

  res.json({ message: "Reset email sent" });
};

/* RESET PASSWORD */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findOne({
    _id: decoded.id,
    resetPasswordToken: token,
    resetPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = await bcrypt.hash(password, 12);
  user.resetPasswordToken = null;
  user.resetPasswordExpiry = null;

  await user.save();

  res.json({ message: "Password reset successful" });
};

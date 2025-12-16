import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { User } from "../models/User.js";
import { signAccessToken } from "../utils/jwt.js";
import { sendMail } from "../utils/mailer.js";
import {
  loginSchema,
  registerSchema,
  requestResetSchema,
  resetPasswordSchema,
} from "../validators/auth.schemas.js";

function sanitizeUser(u: any) {
  const {
    passwordHash,
    resetPasswordTokenHash,
    resetPasswordExpiresAt,
    __v,
    ...rest
  } = u;
  return rest;
}

export const register = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Validation error", errors: parsed.error.flatten() });
  const data = parsed.data;

  const existing = await User.findOne({ email: data.email }).lean();
  if (existing)
    return res.status(409).json({ message: "Email already in use" });

  const passwordHash = await bcrypt.hash(data.password, 12);

  const doc: any = {
    email: data.email,
    passwordHash,
    firstName: data.firstName,
    lastName: data.lastName,
    dateOfBirth: data.dateOfBirth,
    description: data.description,
    role: data.role,
  };

  if (data.role === "employer") {
    doc.employerProfile = {
      companyName: data.companyName!,
      companyWebsite: data.companyWebsite,
      companyDescription: data.companyDescription,
    };
  } else {
    doc.jobseekerProfile = {
      stack: data.stack ?? [],
      portfolioUrls: data.portfolioUrls ?? [],
      cvUrls: [],
      openToWork: false,
      preferences: { employmentTypes: [], workModes: [] },
      studies: [],
    };
  }

  const user = await User.create(doc);
  const token = signAccessToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
  });

  return res.status(201).json({ token, user: sanitizeUser(user.toJSON()) });
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Validation error", errors: parsed.error.flatten() });
  const { email, password } = parsed.data;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signAccessToken({
    sub: String(user._id),
    email: user.email,
    role: user.role,
  });
  return res.json({ token, user: sanitizeUser(user.toJSON()) });
};

export const logout = async (_req: Request, res: Response) => {
  return res.json({ ok: true });
};

export const me = async (req: Request, res: Response) => {
  const auth = (req as any).user as { sub: string };
  const user = await User.findById(auth.sub).lean();
  if (!user) return res.status(404).json({ message: "Not found" });
  res.json(sanitizeUser(user));
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const parsed = requestResetSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Validation error", errors: parsed.error.flatten() });

  const { email } = parsed.data;
  const user = await User.findOne({ email });
  if (!user) return res.json({ ok: true });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordTokenHash = tokenHash;
  user.resetPasswordExpiresAt = new Date(Date.now() + 1000 * 60 * 15);
  await user.save();

  const appUrl = process.env.APP_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  await sendMail({
    to: email,
    subject: "Reset your password",
    html: `
      <p>Hi ${user.firstName || ""},</p>
      <p>We received a request to reset your password. Click the link below:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>This link expires in 15 minutes. If you didn't request it, you can ignore this email.</p>
    `,
  });

  return res.json({ ok: true });
};

export const resetPassword = async (req: Request, res: Response) => {
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Validation error", errors: parsed.error.flatten() });

  const { token, newPassword } = parsed.data;
  const { email } = req.query as { email?: string };
  if (!email) return res.status(400).json({ message: "Missing email" });

  const user = await User.findOne({ email });
  if (!user || !user.resetPasswordTokenHash || !user.resetPasswordExpiresAt)
    return res.status(400).json({ message: "Invalid or expired token" });

  if (user.resetPasswordExpiresAt.getTime() < Date.now())
    return res.status(400).json({ message: "Invalid or expired token" });

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  if (tokenHash !== user.resetPasswordTokenHash)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.set({
    resetPasswordTokenHash: undefined,
    resetPasswordExpiresAt: undefined,
  });
  await user.save();

  return res.json({ ok: true });
};

export const changePassword = async (req: Request, res: Response) => {
  const { changePasswordSchema } = await import("../validators/auth.schemas.js");
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json({ message: "Validation error", errors: parsed.error.flatten() });

  const { currentPassword, newPassword } = parsed.data;
  const auth = (req as any).user as { sub: string };
  const user = await User.findById(auth.sub);
  if (!user) return res.status(404).json({ message: "Not found" });

  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid current password" });

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();

  return res.json({ ok: true });
};
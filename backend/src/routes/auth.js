import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { Router } from "express";
import { resend } from "../config/services.js";
import { permissionsFor } from "../constants.js";
import { requireAuth, normalizeUser } from "../middleware/auth.js";
import { User } from "../models/User.js";
import { logActivity } from "../utils/activity.js";
import { ApiError, asyncHandler } from "../utils/errors.js";
import { PERMANENT_ADMIN_EMAIL } from "../utils/permanentAdmin.js";
import { signToken } from "../utils/tokens.js";
import {
  googleAuthSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  resetRequestSchema,
} from "../validators.js";

export const authRouter = Router();
const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

function authPayload(user, audience = "user") {
  return {
    token: signToken(user, audience),
    user: normalizeUser(user),
    permissions: permissionsFor(user),
  };
}

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: input.email });
    if (existing) throw new ApiError(409, "An account with this email already exists.");
    const user = new User(input);
    await user.setPassword(input.password);
    await user.save();
    await logActivity(user.email, "Auth", "User registered", "Public account created");
    res.status(201).json(authPayload(user));
  }),
);

async function passwordLogin(req, res, audience) {
  const input = loginSchema.parse(req.body);
  const user = await User.findOne({ email: input.email });
  if (!user || !(await user.checkPassword(input.password))) {
    throw new ApiError(401, "Incorrect email or password.");
  }
  if (user.status === "Suspended") throw new ApiError(403, "This account has been suspended.");
  if (audience === "admin" && permissionsFor(user).length === 0) {
    throw new ApiError(403, "This account does not have admin access.");
  }
  await logActivity(user.email, "Auth", audience === "admin" ? "Admin signed in" : "User signed in", "Password login");
  res.json(authPayload(user, audience));
}

authRouter.post("/login", asyncHandler((req, res) => passwordLogin(req, res, "user")));
authRouter.post("/admin/login", asyncHandler((req, res) => passwordLogin(req, res, "admin")));

authRouter.get("/google/config", (req, res) => {
  res.json({ clientId: process.env.GOOGLE_CLIENT_ID || "" });
});

authRouter.post(
  "/google",
  asyncHandler(async (req, res) => {
    if (!googleClient) throw new ApiError(503, "Google OAuth is not configured.");
    const { credential } = googleAuthSchema.parse(req.body);
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch {
      throw new ApiError(401, "Google sign-in could not verify this account.");
    }
    const profile = ticket.getPayload();
    if (!profile?.email || profile.email_verified === false) {
      throw new ApiError(401, "Google account email could not be verified.");
    }
    let user = await User.findOne({ email: profile.email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: profile.name || profile.email.split("@")[0],
        email: profile.email.toLowerCase(),
        phone: "",
        googleId: profile.sub,
        role: profile.email.toLowerCase() === PERMANENT_ADMIN_EMAIL ? "admin" : "user",
      });
    } else if (!user.googleId) {
      user.googleId = profile.sub;
      await user.save();
    }
    if (user.email === PERMANENT_ADMIN_EMAIL && user.role !== "admin") {
      user.role = "admin";
      user.permissions = undefined;
      user.status = "Active";
      await user.save();
    }
    if (user.status === "Suspended") throw new ApiError(403, "This account has been suspended.");
    await logActivity(user.email, "Auth", "User signed in", "Google OAuth login");
    res.json(authPayload(user));
  }),
);

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user, permissions: permissionsFor(req.user) });
});

authRouter.post(
  "/password/forgot",
  asyncHandler(async (req, res) => {
    const { email } = resetRequestSchema.parse(req.body);
    const user = await User.findOne({ email });
    if (!user) throw new ApiError(404, "No account found with that email.");
    const token = crypto.randomBytes(4).toString("hex").toUpperCase();
    user.resetTokenHash = crypto.createHash("sha256").update(token).digest("hex");
    user.resetTokenExpiresAt = new Date(Date.now() + 20 * 60 * 1000);
    await user.save();
    if (resend && process.env.RESEND_FROM) {
      await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: user.email,
        subject: "Your Braj Setu Properties reset code",
        html: `<p>Your Braj Setu Properties reset code is <strong>${token}</strong>. It expires in 20 minutes.</p>`,
      });
    }
    res.json({
      ok: true,
      token: process.env.NODE_ENV === "production" ? undefined : token,
      message: "Reset code sent if email delivery is configured.",
    });
  }),
);

authRouter.post(
  "/password/reset",
  asyncHandler(async (req, res) => {
    const { token, password } = resetPasswordSchema.parse(req.body);
    const hash = crypto.createHash("sha256").update(token.trim().toUpperCase()).digest("hex");
    const user = await User.findOne({
      resetTokenHash: hash,
      resetTokenExpiresAt: { $gt: new Date() },
    });
    if (!user) throw new ApiError(400, "That reset code is invalid or expired.");
    await user.setPassword(password);
    user.resetTokenHash = undefined;
    user.resetTokenExpiresAt = undefined;
    await user.save();
    await logActivity(user.email, "Auth", "Password reset", "User reset password");
    res.json({ ok: true });
  }),
);

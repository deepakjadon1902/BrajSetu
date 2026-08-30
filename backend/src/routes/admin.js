import crypto from "crypto";
import { Router } from "express";
import { imagekitConfigured } from "../config/services.js";
import {
  requireAnyPermission,
  requireAuth,
  requirePermission,
  normalizeUser,
} from "../middleware/auth.js";
import { Activity } from "../models/Activity.js";
import { Enquiry } from "../models/Enquiry.js";
import { NewsArticle } from "../models/NewsArticle.js";
import { Property } from "../models/Property.js";
import { SettingsVersion } from "../models/SettingsVersion.js";
import { SiteSettings, defaultSettings } from "../models/SiteSettings.js";
import { User } from "../models/User.js";
import { logActivity } from "../utils/activity.js";
import { ApiError, asyncHandler } from "../utils/errors.js";
import { newsSchema, propertySchema, userUpdateSchema } from "../validators.js";

export const adminRouter = Router();
adminRouter.use(requireAuth);

function publicId(doc) {
  const object = doc.toObject ? doc.toObject() : doc;
  return {
    ...object,
    id: object.id || String(object._id),
    passwordHash: undefined,
    _id: undefined,
    __v: undefined,
  };
}

function settingsDiff(prev, next) {
  const changed = Object.keys(next).filter(
    (key) => JSON.stringify(prev[key]) !== JSON.stringify(next[key]),
  );
  if (!changed.length) return "No field changes";
  return `${changed.length} field${changed.length > 1 ? "s" : ""} updated: ${changed.slice(0, 4).join(", ")}${changed.length > 4 ? "..." : ""}`;
}

adminRouter.get(
  "/snapshot",
  requirePermission("dashboard"),
  asyncHandler(async (_req, res) => {
    const [
      users,
      properties,
      news,
      enquiries,
      settings,
      activity,
      settingsHistory,
    ] = await Promise.all([
      User.find().sort({ createdAt: -1 }).lean(),
      Property.find().sort({ featured: -1, createdAt: -1 }).lean(),
      NewsArticle.find().sort({ createdAt: -1 }).lean(),
      Enquiry.find().sort({ createdAt: -1 }).lean(),
      SiteSettings.findOne({ singleton: "site" }).lean(),
      Activity.find().sort({ createdAt: -1 }).limit(200).lean(),
      SettingsVersion.find().sort({ createdAt: -1 }).limit(25).lean(),
    ]);
    res.json({
      users: users.map(normalizeUser),
      properties,
      news,
      enquiries: enquiries.map(publicId),
      settings: { ...defaultSettings, ...(settings || {}) },
      activity: activity.map(publicId),
      settingsHistory: settingsHistory.map(publicId),
    });
  }),
);

adminRouter.post(
  "/properties",
  requirePermission("properties"),
  asyncHandler(async (req, res) => {
    const input = propertySchema.parse(req.body);
    const existing = await Property.findOne({ id: input.id });
    const property = await Property.findOneAndUpdate({ id: input.id }, input, {
      new: true,
      upsert: true,
    });
    await logActivity(
      req.user.email,
      "Properties",
      existing ? "Updated property" : "Created property",
      input.title,
    );
    res.json({ property });
  }),
);

adminRouter.delete(
  "/properties/:id",
  requirePermission("properties"),
  asyncHandler(async (req, res) => {
    const property = await Property.findOneAndDelete({ id: req.params.id });
    await logActivity(
      req.user.email,
      "Properties",
      "Deleted property",
      property?.title || req.params.id,
    );
    res.json({ ok: true });
  }),
);

adminRouter.post(
  "/news",
  requirePermission("news"),
  asyncHandler(async (req, res) => {
    const input = newsSchema.parse(req.body);
    const existing = await NewsArticle.findOne({ id: input.id });
    const article = await NewsArticle.findOneAndUpdate(
      { id: input.id },
      input,
      { new: true, upsert: true },
    );
    await logActivity(
      req.user.email,
      "News",
      existing ? "Updated article" : "Published article",
      input.title,
    );
    res.json({ article });
  }),
);

adminRouter.delete(
  "/news/:id",
  requirePermission("news"),
  asyncHandler(async (req, res) => {
    const article = await NewsArticle.findOneAndDelete({ id: req.params.id });
    await logActivity(
      req.user.email,
      "News",
      "Deleted article",
      article?.title || req.params.id,
    );
    res.json({ ok: true });
  }),
);

adminRouter.post(
  "/users",
  requirePermission("users"),
  asyncHandler(async (req, res) => {
    const input = userUpdateSchema.parse(req.body);
    let user = input.id
      ? await User.findById(input.id)
      : await User.findOne({ email: input.email });
    if (!user) user = new User({ email: input.email });
    user.name = input.name;
    user.email = input.email;
    user.phone = input.phone;
    user.role = input.role;
    user.permissions = input.permissions;
    user.status = input.status;
    if (input.password) await user.setPassword(input.password);
    await user.save();
    await logActivity(
      req.user.email,
      "Users",
      input.id ? "Updated user" : "Created user",
      `${user.email} (${user.role}, ${user.status})`,
    );
    res.json({ user: normalizeUser(user) });
  }),
);

adminRouter.delete(
  "/users/:id",
  requirePermission("users"),
  asyncHandler(async (req, res) => {
    if (req.params.id === req.user.id)
      throw new ApiError(400, "You cannot delete your own account.");
    const user = await User.findByIdAndDelete(req.params.id);
    await logActivity(
      req.user.email,
      "Users",
      "Deleted user",
      user?.email || req.params.id,
    );
    res.json({ ok: true });
  }),
);

adminRouter.patch(
  "/enquiries/:id/status",
  requirePermission("enquiries"),
  asyncHandler(async (req, res) => {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true },
    );
    await logActivity(
      req.user.email,
      "Enquiries",
      `Marked enquiry ${req.body.status}`,
      enquiry?.name || req.params.id,
    );
    res.json({ enquiry: publicId(enquiry) });
  }),
);

adminRouter.delete(
  "/enquiries/:id",
  requirePermission("enquiries"),
  asyncHandler(async (req, res) => {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    await logActivity(
      req.user.email,
      "Enquiries",
      "Deleted enquiry",
      enquiry?.name || req.params.id,
    );
    res.json({ ok: true });
  }),
);

adminRouter.put(
  "/settings",
  requirePermission("settings"),
  asyncHandler(async (req, res) => {
    const prev = {
      ...defaultSettings,
      ...((await SiteSettings.findOne({ singleton: "site" }).lean()) || {}),
    };
    const next = { ...defaultSettings, ...req.body, singleton: "site" };
    await SettingsVersion.create({
      actor: req.user.email,
      summary: settingsDiff(prev, next),
      settings: prev,
    });
    const settings = await SiteSettings.findOneAndUpdate(
      { singleton: "site" },
      next,
      { new: true, upsert: true },
    );
    await logActivity(
      req.user.email,
      "Settings",
      "Updated site settings",
      settingsDiff(prev, next),
    );
    res.json({ settings });
  }),
);

adminRouter.post(
  "/settings/reset",
  requirePermission("settings"),
  asyncHandler(async (req, res) => {
    const prev = {
      ...defaultSettings,
      ...((await SiteSettings.findOne({ singleton: "site" }).lean()) || {}),
    };
    await SettingsVersion.create({
      actor: req.user.email,
      summary: "Before reset to defaults",
      settings: prev,
    });
    const settings = await SiteSettings.findOneAndUpdate(
      { singleton: "site" },
      { ...defaultSettings, singleton: "site" },
      { new: true, upsert: true },
    );
    await logActivity(
      req.user.email,
      "Settings",
      "Reset settings",
      "Restored the default branding and metadata",
    );
    res.json({ settings });
  }),
);

adminRouter.post(
  "/settings/restore/:id",
  requirePermission("settings"),
  asyncHandler(async (req, res) => {
    const version = await SettingsVersion.findById(req.params.id).lean();
    if (!version) throw new ApiError(404, "Settings version not found.");
    const current = {
      ...defaultSettings,
      ...((await SiteSettings.findOne({ singleton: "site" }).lean()) || {}),
    };
    await SettingsVersion.create({
      actor: req.user.email,
      summary: "Before rollback",
      settings: current,
    });
    const settings = await SiteSettings.findOneAndUpdate(
      { singleton: "site" },
      { ...defaultSettings, ...version.settings, singleton: "site" },
      { new: true, upsert: true },
    );
    await logActivity(
      req.user.email,
      "Settings",
      "Rolled back settings",
      `Restored version from ${version.createdAt}`,
    );
    res.json({ settings });
  }),
);

adminRouter.delete(
  "/activity",
  requirePermission("activity"),
  asyncHandler(async (req, res) => {
    await Activity.deleteMany({});
    res.json({ ok: true });
  }),
);

adminRouter.get(
  "/imagekit-auth",
  requireAnyPermission(["properties", "settings"]),
  (_req, res, next) => {
    if (!imagekitConfigured)
      return next(new ApiError(503, "ImageKit is not configured."));
    const token = crypto.randomBytes(16).toString("hex");
    const expire = Math.floor(Date.now() / 1000) + 10 * 60;
    const signature = crypto
      .createHmac("sha1", process.env.IMAGEKIT_PRIVATE_KEY)
      .update(token + expire)
      .digest("hex");
    res.json({
      token,
      expire,
      signature,
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
    });
  },
);

import crypto from "crypto";
import { Router } from "express";
import { verifiedListingDisclaimer } from "../constants.js";
import { imagekitConfigured } from "../config/services.js";
import {
  requireAnyPermission,
  requireAuth,
  requirePermission,
  normalizeUser,
} from "../middleware/auth.js";
import { Activity } from "../models/Activity.js";
import { Enquiry } from "../models/Enquiry.js";
import { FraudReport } from "../models/FraudReport.js";
import { NewsArticle } from "../models/NewsArticle.js";
import { Property } from "../models/Property.js";
import { SettingsVersion } from "../models/SettingsVersion.js";
import { SiteSettings, defaultSettings } from "../models/SiteSettings.js";
import { User } from "../models/User.js";
import { logActivity } from "../utils/activity.js";
import { ApiError, asyncHandler } from "../utils/errors.js";
import {
  newsSchema,
  propertySchema,
  userUpdateSchema,
  verificationDecisionSchema,
} from "../validators.js";

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
      fraudReports,
    ] = await Promise.all([
      User.find().sort({ createdAt: -1 }).lean(),
      Property.find().sort({ featured: -1, createdAt: -1 }).lean(),
      NewsArticle.find().sort({ createdAt: -1 }).lean(),
      Enquiry.find().sort({ createdAt: -1 }).lean(),
      SiteSettings.findOne({ singleton: "site" }).lean(),
      Activity.find().sort({ createdAt: -1 }).limit(200).lean(),
      SettingsVersion.find().sort({ createdAt: -1 }).limit(25).lean(),
      FraudReport.find().sort({ createdAt: -1 }).limit(100).lean(),
    ]);
    res.json({
      users: users.map(normalizeUser),
      properties,
      news,
      enquiries: enquiries.map(publicId),
      settings: { ...defaultSettings, ...(settings || {}) },
      activity: activity.map(publicId),
      settingsHistory: settingsHistory.map(publicId),
      fraudReports: fraudReports.map(publicId),
    });
  }),
);

adminRouter.post(
  "/properties",
  requirePermission("properties"),
  asyncHandler(async (req, res) => {
    const input = propertySchema.parse(req.body);
    const existing = await Property.findOne({ id: input.id });
    const next = normalizePropertyForSave(input, req.user.id);
    const property = await Property.findOneAndUpdate({ id: input.id }, next, {
      new: true,
      upsert: true,
    });
    await logActivity(
      req.user.email,
      "Properties",
      existing ? "Updated property" : "Created property",
      `${input.id} - ${input.title}`,
    );
    res.json({ property });
  }),
);

adminRouter.patch(
  "/properties/:id/verification",
  requireAnyPermission(["verification", "properties"]),
  asyncHandler(async (req, res) => {
    const input = verificationDecisionSchema.parse(req.body);
    const property = await Property.findOne({ id: req.params.id });
    if (!property) throw new ApiError(404, "Property listing not found.");

    const now = new Date();
    const update = {
      "verification.status": input.status,
      "verification.level": input.level,
      "verification.scope": property.verification?.scope || verifiedListingDisclaimer,
      "verification.reviewNotes": input.notes,
      "verification.verifiedBy": req.user.id,
      "verification.verifiedAt": ["Approved"].includes(input.status) ? now : property.verification?.verifiedAt,
      "verification.expiresAt": input.expiresAt,
      reviewStatus: mapReviewStatus(input.status),
    };

    if (input.status === "Approved") {
      update.lifecycleStatus = "Active";
      update.publishedAt = property.publishedAt || now;
      update["verification.rejectionReason"] = "";
      update["verification.suspensionReason"] = "";
    }
    if (input.status === "Rejected" || input.status === "Needs Correction") {
      update.lifecycleStatus = "Draft";
      update["verification.rejectionReason"] = input.reason || "";
    }
    if (input.status === "Suspended") {
      update.lifecycleStatus = "Archived";
      update["verification.suspensionReason"] = input.reason || "";
    }
    if (input.status === "Expired") {
      update.lifecycleStatus = "Expired";
      update.archivedAt = now;
    }
    if (input.rera) {
      update.rera = {
        ...(property.rera?.toObject ? property.rera.toObject() : property.rera || {}),
        ...input.rera,
        reviewer: req.user.id,
        verifiedAt: input.rera.status === "CHECKED" ? now : input.rera.verifiedAt,
      };
    }

    const updated = await Property.findOneAndUpdate({ id: req.params.id }, update, { new: true });
    await logActivity(
      req.user.email,
      "Verification",
      `Verification ${input.status}`,
      `${property.id} at ${input.level}: ${input.reason || input.notes}`,
    );
    res.json({ property: updated });
  }),
);

adminRouter.get(
  "/fraud-reports",
  requireAnyPermission(["fraud", "properties"]),
  asyncHandler(async (_req, res) => {
    const reports = await FraudReport.find().sort({ createdAt: -1 }).limit(200).lean();
    res.json({ reports: reports.map(publicId) });
  }),
);

adminRouter.patch(
  "/fraud-reports/:id",
  requirePermission("fraud"),
  asyncHandler(async (req, res) => {
    const report = await FraudReport.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
        severity: req.body.severity,
        adminNotes: req.body.adminNotes,
        assignedTo: req.user.id,
        resolvedAt: ["RESOLVED", "DISMISSED"].includes(req.body.status) ? new Date() : undefined,
        resolvedBy: ["RESOLVED", "DISMISSED"].includes(req.body.status) ? req.user.id : undefined,
      },
      { new: true },
    );
    if (!report) throw new ApiError(404, "Fraud report not found.");
    await logActivity(
      req.user.email,
      "Fraud",
      `Fraud report ${report.status}`,
      report.ticketNumber,
    );
    res.json({ report: publicId(report) });
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

function normalizePropertyForSave(input, actorId) {
  const status = input.reviewStatus || "Approved";
  return {
    ...input,
    transactionType: input.transactionType || input.intent?.toLowerCase(),
    legalOwnerName: input.legalOwnerName || input.ownerName || "",
    publicLocation:
      input.publicLocation || `${input.location?.locality || ""}, ${input.location?.city || ""}`,
    ownerDetails: {
      ...(input.ownerDetails || {}),
      ownerName: input.ownerDetails?.ownerName || input.ownerName || "",
      ownerPhone: input.ownerDetails?.ownerPhone || input.ownerPhone || "",
      ownerEmail: input.ownerDetails?.ownerEmail || input.ownerEmail || "",
      publicContactName:
        input.ownerDetails?.publicContactName || input.ownerDetails?.ownerName || input.ownerName || "",
      publicContactRole:
        input.ownerDetails?.publicContactRole || input.ownerDetails?.ownerRole || "Owner",
    },
    lifecycleStatus: input.lifecycleStatus || (status === "Approved" ? "Active" : "Draft"),
    publishedAt: status === "Approved" ? input.publishedAt || new Date() : input.publishedAt,
    verification: {
      level: input.verification?.level || (status === "Approved" ? "VERIFIED_LISTING" : "OWNER_LISTED"),
      status: input.verification?.status || status,
      scope: input.verification?.scope || verifiedListingDisclaimer,
      verifiedAt:
        input.verification?.verifiedAt || (status === "Approved" ? new Date() : undefined),
      verifiedBy: input.verification?.verifiedBy || (status === "Approved" ? actorId : undefined),
      expiresAt: input.verification?.expiresAt,
      rejectionReason: input.verification?.rejectionReason || "",
      suspensionReason: input.verification?.suspensionReason || "",
      reviewNotes: input.verification?.reviewNotes || "",
    },
  };
}

function mapReviewStatus(status) {
  if (status === "Approved") return "Approved";
  if (status === "Needs Correction") return "Needs Changes";
  return "Pending Review";
}

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

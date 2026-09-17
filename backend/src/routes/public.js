import { Router } from "express";
import crypto from "crypto";
import {
  ownerDeclarationVersion,
  verifiedListingDisclaimer,
} from "../constants.js";
import { resend } from "../config/services.js";
import { Enquiry } from "../models/Enquiry.js";
import { FraudReport } from "../models/FraudReport.js";
import { NewsArticle } from "../models/NewsArticle.js";
import { Property } from "../models/Property.js";
import { SiteSettings, defaultSettings } from "../models/SiteSettings.js";
import {
  enquirySchema,
  fraudReportSchema,
  propertySubmissionSchema,
} from "../validators.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/errors.js";
import { logActivity } from "../utils/activity.js";

export const publicRouter = Router();

publicRouter.get("/", (_req, res) => {
  res.json({ ok: true, service: "braj-setu-api" });
});

function cleanDoc(doc) {
  if (!doc) return doc;
  const object = doc.toObject ? doc.toObject() : doc;
  return {
    ...object,
    id: object.id || String(object._id),
    _id: undefined,
    __v: undefined,
  };
}

function publicProperty(doc) {
  if (!doc) return doc;
  const property = cleanDoc(doc);
  return {
    ...property,
    ownerEmail: undefined,
    ownerPhone: undefined,
    submittedBy: undefined,
    ownerDetails: property.ownerDetails
      ? {
          ownerName: property.ownerDetails.ownerName || property.ownerName || "",
          ownerRole: property.ownerDetails.ownerRole || "",
          organizationName: property.ownerDetails.organizationName || "",
          authorityType: property.ownerDetails.authorityType || "",
          publicContactName: property.ownerDetails.publicContactName || "",
          publicContactRole: property.ownerDetails.publicContactRole || "",
        }
      : undefined,
    documents: undefined,
    riskFlags: undefined,
    duplicateCandidates: undefined,
    verificationChecklist: undefined,
    declarations: property.declarations
      ? {
          ownerDeclarationAccepted: Boolean(property.declarations.ownerDeclarationAccepted),
          ownerDeclarationVersion: property.declarations.ownerDeclarationVersion,
          acceptedAt: property.declarations.acceptedAt,
        }
      : undefined,
    verification: {
      level: property.verification?.level || "OWNER_LISTED",
      status: property.verification?.status || property.reviewStatus || "Approved",
      scope: property.verification?.scope || verifiedListingDisclaimer,
      verifiedAt: property.verification?.verifiedAt,
      expiresAt: property.verification?.expiresAt,
    },
  };
}

function activePublicQuery(extra = {}) {
  return {
    reviewStatus: { $in: ["Approved", null] },
    lifecycleStatus: { $in: ["Active", null] },
    "verification.status": { $nin: ["Rejected", "Suspended", "Expired"] },
    ...extra,
  };
}

function reportTicketNumber() {
  return `FR-${new Date().getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

function requestIp(req) {
  return String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

publicRouter.get(
  "/bootstrap",
  asyncHandler(async (_req, res) => {
    const [properties, news, settings] = await Promise.all([
      Property.find(activePublicQuery())
        .sort({ featured: -1, createdAt: -1 })
        .lean(),
      NewsArticle.find().sort({ createdAt: -1 }).lean(),
      SiteSettings.findOne({ singleton: "site" }).lean(),
    ]);
    res.json({
      properties: properties.map(publicProperty),
      news,
      settings: { ...defaultSettings, ...(settings || {}) },
    });
  }),
);

publicRouter.get(
  "/properties",
  asyncHandler(async (req, res) => {
    const query = {};
    Object.assign(query, activePublicQuery());
    if (req.query.intent) query.intent = req.query.intent;
    if (req.query.category) query.category = req.query.category;
    if (req.query.city)
      query["location.city"] = new RegExp(String(req.query.city), "i");
    const properties = await Property.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .lean();
    res.json({ properties: properties.map(publicProperty) });
  }),
);

publicRouter.get(
  "/properties/:id",
  asyncHandler(async (req, res) => {
    const property = await Property.findOne(activePublicQuery({ id: req.params.id })).lean();
    res.json({ property: publicProperty(property) });
  }),
);

publicRouter.post(
  "/properties",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = propertySubmissionSchema.parse(req.body);
    const duplicateCandidates = await findDuplicateCandidates(input, req.user.id);
    const property = await Property.create({
      ...input,
      id: `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      images: input.images.map((src, index) => ({
        src,
        label: index === 0 ? "Main" : "Bedroom",
      })),
      featured: false,
      status: "New",
      listingSource: "User",
      reviewStatus: "Pending Review",
      submittedBy: req.user.id,
      termsAcceptedAt: new Date(),
      transactionType: input.intent.toLowerCase(),
      legalOwnerName: input.ownerName,
      publicLocation: `${input.location.locality}, ${input.location.city}`,
      propertyDetails: input.propertyDetails || {},
      ownerDetails: {
        ownerName: input.ownerName,
        ownerPhone: input.ownerPhone,
        ownerEmail: input.ownerEmail,
        ownerRole: input.ownerRole || "Owner",
        organizationName: input.organizationName || "",
        ownerAddress: input.ownerAddress || "",
        authorityType: input.authorityType || "",
        publicContactName: input.ownerName,
        publicContactRole: input.ownerRole || "Owner",
      },
      rera: {
        providedNumber: input.reraNumber || "",
        status: input.reraNumber ? "OWNER_PROVIDED" : "NOT_APPLICABLE",
      },
      declarations: {
        loanOrEncumbrance: input.loanOrEncumbrance || "",
        litigationOrDispute: input.litigationOrDispute || "",
        ownerDeclarationAccepted: true,
        ownerDeclarationVersion,
        acceptedAt: new Date(),
        acceptedBy: req.user.id,
        ipAddress: requestIp(req),
        userAgent: String(req.headers["user-agent"] || "").slice(0, 300),
      },
      verification: {
        level: "OWNER_LISTED",
        status: "Pending Review",
        scope: verifiedListingDisclaimer,
      },
      lifecycleStatus: "Draft",
      duplicateCandidates,
    });
    await logActivity(
      req.user.email,
      "Properties",
      "Submitted property for verification",
      `${property.id} (${duplicateCandidates.length} duplicate candidate${duplicateCandidates.length === 1 ? "" : "s"})`,
    );
    res.status(201).json({ property: publicProperty(property) });
  }),
);

publicRouter.post(
  "/properties/:id/report",
  asyncHandler(async (req, res) => {
    const input = fraudReportSchema.parse({ ...req.body, propertyId: req.params.id });
    const property = await Property.findOne({ id: input.propertyId }).lean();
    const severity = input.category === "document_concern" || input.category === "wrong_owner"
      ? "HIGH"
      : "MEDIUM";
    const report = await FraudReport.create({
      ...input,
      ticketNumber: reportTicketNumber(),
      severity,
    });
    await logActivity(
      input.reporterEmail || input.reporterPhone || "public",
      "Fraud",
      "Fraud report created",
      `${report.ticketNumber} for ${property?.title || input.propertyId}`,
    );
    res.status(201).json({
      ticketNumber: report.ticketNumber,
      status: report.status,
      message: "Report received for risk triage.",
    });
  }),
);

publicRouter.get(
  "/news",
  asyncHandler(async (_req, res) => {
    const news = await NewsArticle.find().sort({ createdAt: -1 }).lean();
    res.json({ news });
  }),
);

async function findDuplicateCandidates(input, userId) {
  const sameCity = input.location.city;
  const sameLocality = input.location.locality;
  const normalizedTitle = input.title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const candidates = await Property.find({
    $or: [
      { submittedBy: userId, "location.city": sameCity, "location.locality": sameLocality },
      { ownerPhone: input.ownerPhone },
      { "location.city": sameCity, "location.locality": sameLocality, category: input.category },
    ],
  })
    .select("id title category location specs ownerPhone")
    .limit(10)
    .lean();

  return candidates
    .map((candidate) => {
      const titleTokens = new Set(normalizedTitle.split(" ").filter(Boolean));
      const candidateTokens = String(candidate.title || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .split(" ")
        .filter(Boolean);
      const overlap = candidateTokens.filter((token) => titleTokens.has(token)).length;
      const sameArea = Math.abs((candidate.specs?.area || 0) - input.specs.area) <= 50;
      const confidence = Math.min(
        0.95,
        0.35 +
          (candidate.ownerPhone && candidate.ownerPhone === input.ownerPhone ? 0.3 : 0) +
          (sameArea ? 0.15 : 0) +
          (overlap >= 2 ? 0.15 : 0),
      );
      return {
        listingId: candidate.id,
        confidence,
        reason: [
          candidate.ownerPhone === input.ownerPhone ? "same owner phone" : null,
          sameArea ? "similar area" : null,
          overlap >= 2 ? "similar title" : null,
          "same locality/type",
        ]
          .filter(Boolean)
          .join(", "),
      };
    })
    .filter((candidate) => candidate.confidence >= 0.5);
}

publicRouter.post(
  "/enquiries",
  asyncHandler(async (req, res) => {
    const input = enquirySchema.parse(req.body);
    const enquiry = await Enquiry.create(input);
    if (resend && process.env.RESEND_FROM && process.env.ADMIN_NOTIFY_EMAIL) {
      await resend.emails.send({
        from: process.env.RESEND_FROM,
        to: process.env.ADMIN_NOTIFY_EMAIL,
        replyTo: input.email,
        subject: `New Braj Setu Properties enquiry from ${input.name}`,
        html: `<p><strong>${input.name}</strong> submitted an enquiry.</p><p>${input.message}</p><p>${input.email} | ${input.phone}</p>`,
      });
    }
    res.status(201).json({ enquiry: cleanDoc(enquiry) });
  }),
);

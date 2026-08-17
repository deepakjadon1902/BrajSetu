import { Router } from "express";
import { resend } from "../config/services.js";
import { Enquiry } from "../models/Enquiry.js";
import { NewsArticle } from "../models/NewsArticle.js";
import { Property } from "../models/Property.js";
import { SiteSettings, defaultSettings } from "../models/SiteSettings.js";
import { enquirySchema } from "../validators.js";
import { asyncHandler } from "../utils/errors.js";

export const publicRouter = Router();

function cleanDoc(doc) {
  if (!doc) return doc;
  const object = doc.toObject ? doc.toObject() : doc;
  return { ...object, id: object.id || String(object._id), _id: undefined, __v: undefined };
}

publicRouter.get(
  "/bootstrap",
  asyncHandler(async (_req, res) => {
    const [properties, news, settings] = await Promise.all([
      Property.find().sort({ featured: -1, createdAt: -1 }).lean(),
      NewsArticle.find().sort({ createdAt: -1 }).lean(),
      SiteSettings.findOne({ singleton: "site" }).lean(),
    ]);
    res.json({
      properties,
      news,
      settings: { ...defaultSettings, ...(settings || {}) },
    });
  }),
);

publicRouter.get(
  "/properties",
  asyncHandler(async (req, res) => {
    const query = {};
    if (req.query.intent) query.intent = req.query.intent;
    if (req.query.category) query.category = req.query.category;
    if (req.query.city) query["location.city"] = new RegExp(String(req.query.city), "i");
    const properties = await Property.find(query).sort({ featured: -1, createdAt: -1 }).lean();
    res.json({ properties });
  }),
);

publicRouter.get(
  "/properties/:id",
  asyncHandler(async (req, res) => {
    const property = await Property.findOne({ id: req.params.id }).lean();
    res.json({ property });
  }),
);

publicRouter.get(
  "/news",
  asyncHandler(async (_req, res) => {
    const news = await NewsArticle.find().sort({ createdAt: -1 }).lean();
    res.json({ news });
  }),
);

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
        subject: `New PropVista enquiry from ${input.name}`,
        html: `<p><strong>${input.name}</strong> submitted an enquiry.</p><p>${input.message}</p><p>${input.email} | ${input.phone}</p>`,
      });
    }
    res.status(201).json({ enquiry: cleanDoc(enquiry) });
  }),
);

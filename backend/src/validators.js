import { z } from "zod";
import {
  listingLifecycleStatuses,
  verificationLevels,
  verificationStatuses,
} from "./constants.js";

const email = z.string().trim().email().toLowerCase();
const optionalEmail = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  email.optional(),
);
const optionalPhone = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().min(8).max(20).optional(),
);
const propertyCategories = ["Shop", "Flat", "Plot", "House", "Farm House"];
const propertyIntents = ["Sale", "Rent"];
const furnishingOptions = [
  "Unfurnished",
  "Semi-furnished",
  "Furnished",
  "Bare shell",
];
const reviewStatuses = ["Pending Review", "Approved", "Needs Changes"];
const reraStatuses = [
  "NOT_APPLICABLE",
  "OWNER_PROVIDED",
  "CHECK_PENDING",
  "CHECKED",
  "MISMATCH",
  "ISSUE",
];

const verificationSchema = z
  .object({
    level: z.enum(verificationLevels).default("OWNER_LISTED"),
    status: z.enum(verificationStatuses).default("Pending Review"),
    scope: z.string().trim().max(1500).optional(),
    verifiedAt: z.coerce.date().optional(),
    verifiedBy: z.string().optional(),
    expiresAt: z.coerce.date().optional(),
    rejectionReason: z.string().trim().max(1000).optional(),
    suspensionReason: z.string().trim().max(1000).optional(),
    reviewNotes: z.string().trim().max(2000).optional(),
  })
  .partial();

const reraSchema = z
  .object({
    providedNumber: z.string().trim().max(80).optional(),
    state: z.string().trim().max(80).optional(),
    status: z.enum(reraStatuses).optional(),
    projectName: z.string().trim().max(160).optional(),
    promoter: z.string().trim().max(160).optional(),
    verifiedAt: z.coerce.date().optional(),
    source: z.string().trim().max(300).optional(),
    reviewer: z.string().optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .partial();

const propertyDetailsSchema = z
  .object({
    fullAddress: z.string().trim().max(300).optional(),
    landmark: z.string().trim().max(160).optional(),
    areaUnit: z.enum(["sq.ft", "sq.m", "sq.yd", "acre", "bigha"]).optional(),
    plotArea: z.coerce.number().min(0).max(10000000).optional(),
    carpetArea: z.coerce.number().min(0).max(10000000).optional(),
    builtUpArea: z.coerce.number().min(0).max(10000000).optional(),
    floor: z.string().trim().max(40).optional(),
    totalFloors: z.string().trim().max(40).optional(),
    balconies: z.coerce.number().int().min(0).max(100).optional(),
    parking: z.string().trim().max(120).optional(),
    availability: z.string().trim().max(120).optional(),
    facing: z.string().trim().max(80).optional(),
    roadWidth: z.string().trim().max(80).optional(),
    leaseType: z.string().trim().max(120).optional(),
    priceNegotiable: z.boolean().optional(),
    gatedCommunity: z.boolean().optional(),
    gasPipeline: z.boolean().optional(),
    waterSupply: z.string().trim().max(120).optional(),
    powerBackup: z.string().trim().max(120).optional(),
  })
  .partial();

const ownerDetailsSchema = z
  .object({
    ownerName: z.string().trim().max(120).optional(),
    ownerPhone: z.string().trim().max(20).optional(),
    ownerEmail: optionalEmail,
    ownerRole: z
      .enum(["Owner", "Landlord", "Developer", "Authorized Partner", "Broker", ""])
      .optional(),
    organizationName: z.string().trim().max(160).optional(),
    ownerAddress: z.string().trim().max(300).optional(),
    authorityType: z.string().trim().max(160).optional(),
    publicContactName: z.string().trim().max(120).optional(),
    publicContactRole: z.string().trim().max(120).optional(),
  })
  .partial();

export const registerSchema = z.object({
  name: z.string().trim().min(2),
  email,
  phone: z.string().trim().min(8),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/)
    .regex(/\d/),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1),
});

export const googleAuthSchema = z.object({
  credential: z.string().min(20),
});

export const resetRequestSchema = z.object({ email });

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(6),
  password: z
    .string()
    .min(8)
    .regex(/[A-Za-z]/)
    .regex(/\d/),
});

export const propertySchema = z.object({
  id: z.string().trim().min(2),
  title: z.string().trim().min(2).max(120),
  category: z.enum(propertyCategories),
  intent: z.enum(propertyIntents),
  price: z.coerce.number().min(1).max(10000000000),
  location: z.object({
    city: z.string().trim().min(2).max(80),
    locality: z.string().trim().min(2).max(120).default(""),
  }),
  specs: z.object({
    area: z.coerce.number().min(1).max(10000000),
    bedrooms: z.coerce.number().int().min(0).max(50).optional(),
    bathrooms: z.coerce.number().int().min(0).max(50).optional(),
    furnishing: z.enum(furnishingOptions).optional(),
  }),
  propertyDetails: propertyDetailsSchema.optional(),
  images: z
    .array(
      z.union([
        z.string(),
        z.object({
          src: z.string().default(""),
          label: z
            .enum(["Main", "Bedroom", "Kitchen", "Bathroom", "Balcony"])
            .default("Bedroom"),
        }),
      ]),
    )
    .default([]),
  amenities: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
  status: z.enum(["New", "Active", "Price Drop"]).optional(),
  description: z.string().trim().min(20).max(2500).optional(),
  listingSource: z.enum(["Admin", "User"]).optional(),
  reviewStatus: z.enum(reviewStatuses).optional(),
  submittedBy: z.string().optional(),
  ownerName: z.string().trim().max(120).optional(),
  ownerEmail: optionalEmail,
  ownerPhone: optionalPhone,
  ownerDetails: ownerDetailsSchema.optional(),
  termsAcceptedAt: z.coerce.date().optional(),
  transactionType: z.enum(["sale", "rent", "lease"]).optional(),
  ownershipType: z.string().trim().max(80).optional(),
  legalOwnerName: z.string().trim().max(120).optional(),
  publicLocation: z.string().trim().max(180).optional(),
  availabilityDate: z.coerce.date().optional(),
  constructionStatus: z.string().trim().max(80).optional(),
  propertyAge: z.string().trim().max(80).optional(),
  lifecycleStatus: z.enum(listingLifecycleStatuses).optional(),
  rera: reraSchema.optional(),
  declarations: z
    .object({
      loanOrEncumbrance: z.string().trim().max(500).optional(),
      litigationOrDispute: z.string().trim().max(500).optional(),
      ownerDeclarationAccepted: z.boolean().optional(),
      ownerDeclarationVersion: z.string().trim().max(80).optional(),
      acceptedAt: z.coerce.date().optional(),
      acceptedBy: z.string().optional(),
      ipAddress: z.string().trim().max(80).optional(),
      userAgent: z.string().trim().max(300).optional(),
    })
    .partial()
    .optional(),
  verification: verificationSchema.optional(),
  verificationChecklist: z.array(z.unknown()).optional(),
  documents: z.array(z.unknown()).optional(),
  riskFlags: z.array(z.unknown()).optional(),
  duplicateCandidates: z.array(z.unknown()).optional(),
});

export const propertySubmissionSchema = propertySchema
  .omit({
    id: true,
    featured: true,
    status: true,
    listingSource: true,
    reviewStatus: true,
    submittedBy: true,
    ownerName: true,
    ownerEmail: true,
    ownerPhone: true,
    termsAcceptedAt: true,
  })
  .extend({
    title: z.string().trim().min(8).max(120),
    description: z.string().trim().min(40).max(2500),
    images: z.array(z.string().trim().url()).max(8).default([]),
    ownerName: z.string().trim().min(2).max(120),
    ownerEmail: email,
    ownerPhone: z.string().trim().min(8).max(20),
    ownerRole: z
      .enum(["Owner", "Landlord", "Developer", "Authorized Partner", "Broker", ""])
      .default("Owner"),
    organizationName: z.string().trim().max(160).optional(),
    ownerAddress: z.string().trim().max(300).optional(),
    authorityType: z.string().trim().min(2).max(160),
    propertyDetails: propertyDetailsSchema.optional(),
    termsAccepted: z.literal(true),
    loanOrEncumbrance: z.string().trim().max(500).optional(),
    litigationOrDispute: z.string().trim().max(500).optional(),
    reraNumber: z.string().trim().max(80).optional(),
  });

export const verificationDecisionSchema = z
  .object({
    status: z.enum(["Under Review", "Needs Correction", "Approved", "Rejected", "Suspended", "Expired"]),
    level: z.enum(verificationLevels).default("OWNER_LISTED"),
    notes: z.string().trim().min(5).max(2000),
    reason: z.string().trim().max(1000).optional(),
    expiresAt: z.coerce.date().optional(),
    rera: reraSchema.optional(),
  })
  .superRefine((input, ctx) => {
    if (["Rejected", "Suspended", "Needs Correction"].includes(input.status) && !input.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["reason"],
        message: "A reason is required for this verification decision.",
      });
    }
  });

export const fraudReportSchema = z.object({
  propertyId: z.string().trim().min(2).max(120),
  reporterName: z.string().trim().min(2).max(120),
  reporterEmail: optionalEmail,
  reporterPhone: optionalPhone,
  category: z.enum([
    "fake_property",
    "wrong_owner",
    "misleading_price",
    "duplicate_listing",
    "document_concern",
    "other",
  ]),
  message: z.string().trim().min(20).max(2500),
});

export const newsSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(2),
  excerpt: z.string().trim().min(2),
  date: z.string().trim().min(2),
  image: z.string().optional().default(""),
});

export const enquirySchema = z.object({
  name: z.string().trim().min(2),
  email,
  phone: z.string().trim().min(8),
  message: z.string().trim().min(10),
  propertyId: z.string().optional(),
});

export const userUpdateSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2),
  email,
  phone: z.string().optional().default(""),
  password: z.string().min(8).optional(),
  role: z.enum(["user", "owner", "developer", "editor", "manager", "verifier", "support", "admin"]),
  permissions: z.array(z.string()).optional(),
  status: z.enum(["Active", "Suspended"]).default("Active"),
});

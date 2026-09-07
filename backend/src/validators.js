import { z } from "zod";

const email = z.string().trim().email().toLowerCase();
const propertyCategories = ["Shop", "Flat", "Plot", "House", "Farm House"];
const propertyIntents = ["Sale", "Rent"];
const furnishingOptions = [
  "Unfurnished",
  "Semi-furnished",
  "Furnished",
  "Bare shell",
];
const reviewStatuses = ["Pending Review", "Approved", "Needs Changes"];

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
  ownerEmail: email.optional(),
  ownerPhone: z.string().trim().min(8).max(20).optional(),
  termsAcceptedAt: z.coerce.date().optional(),
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
    termsAccepted: z.literal(true),
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
  role: z.enum(["user", "editor", "manager", "admin"]),
  permissions: z.array(z.string()).optional(),
  status: z.enum(["Active", "Suspended"]).default("Active"),
});

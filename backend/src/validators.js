import { z } from "zod";

const email = z.string().trim().email().toLowerCase();

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
  title: z.string().trim().min(2),
  category: z.enum(["Shop", "Flat", "Plot", "House", "Farm House"]),
  intent: z.enum(["Sale", "Rent"]),
  price: z.coerce.number().min(0),
  location: z.object({
    city: z.string().trim().min(2),
    locality: z.string().trim().default(""),
  }),
  specs: z.object({
    area: z.coerce.number().min(0),
    bedrooms: z.coerce.number().optional(),
    bathrooms: z.coerce.number().optional(),
    furnishing: z.string().optional(),
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
  description: z.string().optional(),
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

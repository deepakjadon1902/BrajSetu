import "dotenv/config";
import { connectDb } from "./config/db.js";
import { Activity } from "./models/Activity.js";
import { Enquiry } from "./models/Enquiry.js";
import { NewsArticle } from "./models/NewsArticle.js";
import { Property } from "./models/Property.js";
import { SiteSettings, defaultSettings } from "./models/SiteSettings.js";
import { User } from "./models/User.js";
import {
  ensurePermanentAdmin,
  PERMANENT_ADMIN_EMAIL,
} from "./utils/permanentAdmin.js";

const imageBase =
  process.env.IMAGEKIT_URL_ENDPOINT || "https://images.unsplash.com";

const properties = [
  {
    id: "pv-001",
    title: "Vrindavan Garden Villa",
    category: "House",
    intent: "Sale",
    price: 18500000,
    location: { city: "Vrindavan", locality: "Chhatikara Road" },
    specs: {
      area: 3200,
      bedrooms: 4,
      bathrooms: 4,
      furnishing: "Semi-furnished",
    },
    images: [
      {
        src: `${imageBase}/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80`,
        label: "Main",
      },
    ],
    amenities: [
      "Backyard",
      "Fireplace",
      "Garden",
      "Storage",
      "Surveillance Cameras",
    ],
    featured: true,
    status: "New",
    description:
      "A north-facing villa on a quiet tree-lined avenue, built around a double-height living core with a private lawn and covered parking for three cars.",
  },
  {
    id: "pv-002",
    title: "Prem Mandir View Flat",
    category: "Flat",
    intent: "Sale",
    price: 9750000,
    location: { city: "Vrindavan", locality: "Raman Reti" },
    specs: { area: 1450, bedrooms: 3, bathrooms: 3, furnishing: "Furnished" },
    images: [
      {
        src: `${imageBase}/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80`,
        label: "Main",
      },
    ],
    amenities: ["Gym", "Swimming Pool", "Surveillance Cameras", "Laundry"],
    featured: true,
    status: "Active",
    description:
      "High-floor residence with an uninterrupted skyline outlook, a wraparound terrace and access to a full clubhouse deck.",
  },
  {
    id: "pv-003",
    title: "Mathura Bazaar Front Shop",
    category: "Shop",
    intent: "Rent",
    price: 145000,
    location: { city: "Mathura", locality: "Holi Gate" },
    specs: { area: 820, furnishing: "Bare shell" },
    images: [
      {
        src: `${imageBase}/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80`,
        label: "Main",
      },
    ],
    amenities: ["Storage", "Surveillance Cameras"],
    status: "New",
    description:
      "Corner retail frontage on a high-footfall boulevard with 18 ft of glass display and dedicated customer parking.",
  },
];

const news = [
  {
    id: "n1",
    title: "Where buyer demand is quietly shifting this quarter",
    excerpt:
      "Secondary corridors are absorbing inventory faster than prime pockets.",
    date: "12 July 2026",
    image: `${imageBase}/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80`,
  },
  {
    id: "n2",
    title: "A practical checklist before you sign the agreement",
    excerpt:
      "Six title and approval checks that prevent expensive surprises later.",
    date: "04 July 2026",
    image: `${imageBase}/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80`,
  },
];

async function upsertUser(input) {
  let user = await User.findOne({ email: input.email });
  if (!user) user = new User(input);
  Object.assign(user, input);
  await user.setPassword(input.password);
  await user.save();
}

await connectDb();

await Promise.all([
  Property.deleteMany({}),
  NewsArticle.deleteMany({}),
  Enquiry.deleteMany({}),
  Activity.deleteMany({}),
]);

await Promise.all([
  upsertUser({
    name: "Braj Setu Admin",
    email: PERMANENT_ADMIN_EMAIL,
    phone: "+91 98200 00000",
    password: process.env.PERMANENT_ADMIN_PASSWORD || "Admin@123",
    role: "admin",
    status: "Active",
  }),
]);

await ensurePermanentAdmin();

await Property.insertMany(properties);
await NewsArticle.insertMany(news);
await SiteSettings.findOneAndUpdate(
  { singleton: "site" },
  { ...defaultSettings, singleton: "site" },
  { upsert: true },
);
await Enquiry.create({
  name: "Braj Enquiry",
  email: "brajsetuproperties@gmail.com",
  phone: "+91 98765 43210",
  message:
    "Interested in a site visit for the Chhatikara Road villa this weekend.",
  propertyId: "pv-001",
  status: "New",
});

console.log("Braj Setu Properties seed complete.");
process.exit(0);

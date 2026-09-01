import mongoose from "mongoose";

export const defaultSettings = {
  siteName: "Braj Setu Properties",
  logoInitials: "BS",
  tagline:
    "A heritage-led property consultancy bridging owners and buyers to verified shops, flats, plots, houses and farm houses.",
  metaTitle: "Braj Setu Properties | Premium Property Marketplace",
  metaDescription:
    "Braj Setu Properties bridges buyers, tenants and owners to verified flats, houses, plots, shops and farm houses.",
  contactEmail: "brajsetuproperties@gmail.com",
  contactPhone: "+91 90000 00000",
  address:
    "Raja wala mandir, Infront of Giriraj ji Maharaj, Goverdhan, Mathura, Uttar Pradesh 281502",
  ogTitle: "Braj Setu Properties | Premium Property Marketplace",
  ogDescription:
    "Buy, rent and sell verified property with a boutique advisory team.",
  ogImage: "/braj-setu-logo.jpeg",
  twitterCard: "summary_large_image",
  twitterHandle: "@brajsetuproperties",
  socialFacebook: "",
  socialInstagram: "",
  socialLinkedin: "",
  socialX: "",
  announcementEnabled: true,
  announcementMessage:
    "New this week: verified Braj Mandal listings added across Vrindavan, Mathura and Goverdhan.",
  announcementTone: "navy",
};

const siteSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "site", unique: true },
    ...Object.fromEntries(
      Object.keys(defaultSettings).map((key) => [
        key,
        { type: mongoose.Schema.Types.Mixed },
      ]),
    ),
  },
  { timestamps: true, strict: false },
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

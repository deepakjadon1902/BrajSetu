import mongoose from "mongoose";

export const defaultSettings = {
  siteName: "PropVista",
  logoInitials: "PV",
  tagline:
    "A boutique property consultancy helping owners and buyers move with clarity across shops, flats, plots, houses and farm houses.",
  metaTitle: "PropVista | Premium Property Marketplace",
  metaDescription:
    "PropVista is a boutique property marketplace for buying, renting and selling flats, houses, plots, shops and farm houses.",
  contactEmail: "hello@propvista.in",
  contactPhone: "+91 90000 00000",
  address: "4th Floor, Meridian House, Baner Road, Pune 411045",
  ogTitle: "PropVista | Premium Property Marketplace",
  ogDescription: "Buy, rent and sell verified property with a boutique advisory team.",
  ogImage: "",
  twitterCard: "summary_large_image",
  twitterHandle: "@propvista",
  socialFacebook: "https://facebook.com/propvista",
  socialInstagram: "https://instagram.com/propvista",
  socialLinkedin: "https://linkedin.com/company/propvista",
  socialX: "https://x.com/propvista",
  announcementEnabled: true,
  announcementMessage: "New this week: 24 verified listings added across Pune, Mumbai and Goa.",
  announcementTone: "navy",
};

const siteSettingsSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "site", unique: true },
    ...Object.fromEntries(Object.keys(defaultSettings).map((key) => [key, { type: mongoose.Schema.Types.Mixed }])),
  },
  { timestamps: true, strict: false },
);

export const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

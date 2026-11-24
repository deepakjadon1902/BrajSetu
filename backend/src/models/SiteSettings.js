import mongoose from "mongoose";

export const defaultSettings = {
  siteName: "Braj Setu Properties",
  logoInitials: "BS",
  tagline: "Connecting buyers, tenants and property owners across Braj Mandal.",
  metaTitle: "Braj Setu Properties | Premium Property Marketplace",
  metaDescription:
    "Find flats, houses, plots, shops and farm houses across Vrindavan, Mathura and nearby Braj towns.",
  contactEmail: "brajsetuproperties@gmail.com",
  contactPhone: "+91 90000 00000",
  address:
    "Raja wala mandir, Infront of Giriraj ji Maharaj, Goverdhan, Mathura, Uttar Pradesh 281502",
  ogTitle: "Braj Setu Properties | Premium Property Marketplace",
  ogDescription:
    "Local property listings and support for buyers, tenants and owners in Braj.",
  ogImage: "https://www.brajsetuproperties.com/braj-setu-logo.jpeg",
  twitterCard: "summary_large_image",
  twitterHandle: "@brajsetuproperties",
  socialFacebook: "",
  socialInstagram: "",
  socialLinkedin: "",
  socialX: "",
  announcementEnabled: false,
  announcementMessage:
    "Explore properties across Vrindavan, Mathura and nearby Braj towns.",
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

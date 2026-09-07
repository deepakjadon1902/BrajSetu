import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Shop", "Flat", "Plot", "House", "Farm House"],
      required: true,
    },
    intent: { type: String, enum: ["Sale", "Rent"], required: true },
    price: { type: Number, required: true, min: 0 },
    location: {
      city: { type: String, required: true, trim: true },
      locality: { type: String, default: "", trim: true },
    },
    specs: {
      area: { type: Number, required: true, min: 0 },
      bedrooms: Number,
      bathrooms: Number,
      furnishing: String,
    },
    images: [{ type: mongoose.Schema.Types.Mixed }],
    amenities: [{ type: String }],
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["New", "Active", "Price Drop"],
      default: "Active",
    },
    description: { type: String, default: "" },
    listingSource: {
      type: String,
      enum: ["Admin", "User"],
      default: "Admin",
    },
    reviewStatus: {
      type: String,
      enum: ["Pending Review", "Approved", "Needs Changes"],
      default: "Approved",
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerName: { type: String, default: "", trim: true },
    ownerEmail: { type: String, default: "", trim: true },
    ownerPhone: { type: String, default: "", trim: true },
    termsAcceptedAt: Date,
  },
  { timestamps: true },
);

propertySchema.index({
  title: "text",
  "location.city": "text",
  "location.locality": "text",
  category: "text",
});

export const Property = mongoose.model("Property", propertySchema);

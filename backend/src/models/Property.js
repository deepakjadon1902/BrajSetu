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

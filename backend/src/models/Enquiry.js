import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    propertyId: { type: String, default: "" },
    status: { type: String, enum: ["New", "Contacted", "Closed"], default: "New" },
  },
  { timestamps: true },
);

export const Enquiry = mongoose.model("Enquiry", enquirySchema);

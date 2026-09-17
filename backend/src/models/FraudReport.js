import mongoose from "mongoose";

const fraudReportSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, required: true, unique: true, index: true },
    propertyId: { type: String, required: true, index: true },
    reporterName: { type: String, required: true, trim: true },
    reporterEmail: { type: String, default: "", trim: true },
    reporterPhone: { type: String, default: "", trim: true },
    category: {
      type: String,
      enum: [
        "fake_property",
        "wrong_owner",
        "misleading_price",
        "duplicate_listing",
        "document_concern",
        "other",
      ],
      required: true,
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["NEW", "TRIAGE", "OWNER_RESPONSE_REQUESTED", "RESOLVED", "DISMISSED"],
      default: "NEW",
      index: true,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminNotes: { type: String, default: "", trim: true },
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export const FraudReport = mongoose.model("FraudReport", fraudReportSchema);

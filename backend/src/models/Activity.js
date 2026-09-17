import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    actor: { type: String, required: true },
    area: {
      type: String,
      enum: [
        "Settings",
        "Properties",
        "Verification",
        "Fraud",
        "Documents",
        "Users",
        "Enquiries",
        "News",
        "Auth",
        "Policy",
      ],
      required: true,
    },
    action: { type: String, required: true },
    detail: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Activity = mongoose.model("Activity", activitySchema);

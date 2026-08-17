import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    actor: { type: String, required: true },
    area: {
      type: String,
      enum: ["Settings", "Properties", "Users", "Enquiries", "News", "Auth"],
      required: true,
    },
    action: { type: String, required: true },
    detail: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Activity = mongoose.model("Activity", activitySchema);

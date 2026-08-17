import mongoose from "mongoose";

const settingsVersionSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true },
    summary: { type: String, required: true },
    settings: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true },
);

export const SettingsVersion = mongoose.model("SettingsVersion", settingsVersionSchema);

import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, default: "" },
    googleId: { type: String, index: true },
    role: { type: String, enum: ["user", "editor", "manager", "admin"], default: "user" },
    permissions: [{ type: String }],
    status: { type: String, enum: ["Active", "Suspended"], default: "Active" },
    resetTokenHash: String,
    resetTokenExpiresAt: Date,
  },
  { timestamps: true },
);

userSchema.methods.setPassword = async function setPassword(password) {
  this.passwordHash = await bcrypt.hash(password, 12);
};

userSchema.methods.checkPassword = function checkPassword(password) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model("User", userSchema);

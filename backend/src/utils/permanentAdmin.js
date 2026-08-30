import { User } from "../models/User.js";

export const PERMANENT_ADMIN_EMAIL =
  (process.env.PERMANENT_ADMIN_EMAIL || "brajsetuproperties@gmail.com").toLowerCase();

export async function ensurePermanentAdmin() {
  const password = process.env.PERMANENT_ADMIN_PASSWORD;
  if (!password) {
    console.warn("PERMANENT_ADMIN_PASSWORD is not set; permanent admin was not updated.");
    return;
  }

  let admin = await User.findOne({ email: PERMANENT_ADMIN_EMAIL });
  if (!admin) {
    admin = new User({
      name: "Braj Setu Properties Admin",
      email: PERMANENT_ADMIN_EMAIL,
      phone: process.env.PERMANENT_ADMIN_PHONE || "",
    });
  }

  admin.name = admin.name || "Braj Setu Properties Admin";
  admin.role = "admin";
  admin.permissions = undefined;
  admin.status = "Active";
  await admin.setPassword(password);
  await admin.save();
}

import { Activity } from "../models/Activity.js";

export async function logActivity(actor, area, action, detail) {
  await Activity.create({
    actor: actor || "system",
    area,
    action,
    detail,
  });
}

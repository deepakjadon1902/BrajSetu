import { permissionsFor } from "../constants.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/errors.js";
import { verifyToken } from "../utils/tokens.js";

export async function optionalAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return next();
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).lean();
    if (user && user.status === "Active") req.user = normalizeUser(user);
  } catch {
    /* Anonymous access is allowed here. */
  }
  next();
}

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "Authentication required.");
    const payload = verifyToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user || user.status !== "Active") throw new ApiError(401, "Session expired.");
    req.user = normalizeUser(user);
    next();
  } catch (error) {
    next(error.status ? error : new ApiError(401, "Session expired."));
  }
}

export function requirePermission(permission) {
  return (req, _res, next) => {
    if (!permissionsFor(req.user).includes(permission)) {
      return next(new ApiError(403, "You do not have access to this admin area."));
    }
    next();
  };
}

export function normalizeUser(user) {
  return {
    id: String(user._id || user.id),
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    permissions: user.permissions,
    status: user.status,
    createdAt: user.createdAt,
  };
}

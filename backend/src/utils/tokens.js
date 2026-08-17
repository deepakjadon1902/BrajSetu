import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "dev-only-change-me";
const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(user, audience = "user") {
  return jwt.sign({ sub: user.id, role: user.role, aud: audience }, secret, { expiresIn });
}

export function verifyToken(token) {
  return jwt.verify(token, secret);
}

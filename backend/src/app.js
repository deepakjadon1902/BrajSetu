import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { publicRouter } from "./routes/public.js";

export function createApp() {
  const app = express();
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.PUBLIC_SITE_URL,
    "https://braj-setu.vercel.app",
    "http://localhost:8080",
    "http://localhost:8081",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
    "http://localhost:5173",
    "http://localhost:4173",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4173",
  ].filter(Boolean);

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked origin: ${origin}`));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "8mb" }));
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true }));

  app.get("/health", (_req, res) => res.json({ ok: true, service: "braj-setu-api" }));
  app.use("/api/auth", authRouter);
  app.use("/api", publicRouter);
  app.use("/api/admin", adminRouter);

  app.use((req, res) => res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` }));
  app.use((error, _req, res, _next) => {
    if (error.name === "ZodError") {
      return res.status(400).json({ error: "Validation failed.", details: error.flatten() });
    }
    const status = error.status || 500;
    if (status >= 500) console.error(error);
    res.status(status).json({ error: error.message || "Something went wrong." });
  });

  return app;
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { createLogger, format, transports } from "winston";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

// Initialize Prisma Client
export const prisma = new PrismaClient();

// Initialize Express app
const app = express();

// Logger configuration
export const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  defaultMeta: { service: "cena-api" },
  transports: [
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://cdn.tailwindcss.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://esm.sh"],
      },
    },
  }),
);

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : ["http://localhost:5001", "http://127.0.0.1:5001"],
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

/**
 * Arquitetura de portas
 * ---------------------
 * DEV
 *   - API:      http://localhost:3001
 *   - Frontend: http://localhost:5001  (Vite dev server)
 *   - Vite faz proxy /api -> 3001
 *
 * PRODUÇÃO (npm start)
 *   - Express serve API + arquivos estáticos da pasta dist/ na porta process.env.PORT
 *   - Replit mapeia essa porta para o domínio público.
 */

// Routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import themeRoutes from "./routes/themes";
import submissionRoutes from "./routes/submissions";

// ─── Servir a pasta dist/ em produção ──────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.join(__dirname, "..", "dist");

// Arquivos estáticos (JS/CSS/img)
app.use(express.static(distPath));

// Qualquer rota que NÃO comece por /api devolve o index.html do React
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/themes", themeRoutes);
app.use("/api/submissions", submissionRoutes);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error("Unhandled error:", err);

    if (res.headersSent) {
      return next(err);
    }

    res.status(500).json({
      success: false,
      error:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  },
);

// 404 handler — sem o caractere '*' para evitar o bug do path-to-regexp
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

export default app;

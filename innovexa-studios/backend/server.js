require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const contactRoutes = require("./routes/contact");
const { logEmailConfig } = require("./utils/mailer");

const app = express();

// Render sets RENDER=true; NODE_ENV=production is also honoured.
const isProd = process.env.NODE_ENV === "production" || !!process.env.RENDER;
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// ---------- Fail fast on missing configuration ----------
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set. Add it to backend/.env (local) or the Render dashboard.");
  process.exit(1);
}

// Behind Render's proxy: needed so rate limiting sees the real visitor IP
// and not the proxy's address.
app.set("trust proxy", 1);
app.disable("x-powered-by");

// ---------- Security headers ----------
app.use(helmet());

// ---------- CORS ----------
// CLIENT_URL = deployed frontend origin(s), comma-separated, no trailing slash, e.g.
//   CLIENT_URL=https://innovexa-studios.onrender.com
// In development it defaults to the local Vite/CRA ports.
const normalizeOrigin = (o) => o.trim().replace(/\/+$/, "");
const allowedOrigins = (
  process.env.CLIENT_URL || (isProd ? "" : "http://localhost:5173,http://localhost:3000")
)
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

if (isProd && allowedOrigins.length === 0) {
  console.error("❌ CLIENT_URL is not set. Set it to your deployed frontend URL, otherwise the browser will block every request.");
  process.exit(1);
}

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header = non-browser client (curl, health checks) → allow
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      console.warn(`CORS: blocked origin ${origin} (allowed: ${allowedOrigins.join(", ")})`);
      return callback(null, false); // omit CORS headers → browser blocks it
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ---------- Rate limiting (contact endpoint) ----------
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions from this IP. Please try again later.",
  },
});

// ---------- Routes ----------
app.get("/", (req, res) => {
  res.json({ service: "INNOVEXA STUDIOS API", status: "ok" });
});

// Use /api/health as the Render "Health Check Path"
app.get("/api/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "ok" : "degraded",
    service: "INNOVEXA STUDIOS API",
    database: dbConnected ? "connected" : "disconnected",
  });
});

app.use("/api/contact", contactLimiter, contactRoutes);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// ---------- Global error handler ----------
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Invalid JSON in request body." });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body too large." });
  }
  console.error(isProd ? err.message : err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// ---------- Start ----------
// Listen immediately so Render detects the open port, then connect to MongoDB.
// /api/health reports 503 until the database is connected.
const server = app.listen(PORT, () => {
  console.log(`🚀 INNOVEXA STUDIOS API listening on port ${PORT} (${isProd ? "production" : "development"})`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(", ") || "(none)"}`);
  logEmailConfig();
});

mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
mongoose.connection.on("disconnected", () => console.warn("⚠️  MongoDB disconnected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err.message));

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .catch((err) => {
    // Typical causes: wrong password, IP not allowed in Atlas Network Access, bad URI.
    console.error("❌ MongoDB initial connection failed:", err.message);
    process.exit(1); // Render restarts the service automatically
  });

// ---------- Graceful shutdown ----------
function shutdown(signal) {
  console.log(`${signal} received — shutting down`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
    } finally {
      process.exit(0);
    }
  });
  setTimeout(() => process.exit(1), 10000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("unhandledRejection", (reason) => console.error("Unhandled rejection:", reason));

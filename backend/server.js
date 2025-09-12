// server.js
import express from "express";
import cors from "cors";
import session from "express-session";
import cookieParser from "cookie-parser";
import { RedisStore } from "connect-redis";
import { redisClient } from "./config/redis.js";

import helmet from "helmet";
import path from "path";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.js";
import profileRoutes from "./routes/profile.js";
import productRoutes from "./routes/product.js";
import adminRoutes from "./routes/admin.js";
import cartRoutes from "./routes/cart.js";
import orderRoutes from "./routes/orders.js";
import categoryRoutes from "./routes/categories.js";
import checkoutRoutes from "./routes/checkout.js";
import paymentVerificationRoutes from "./routes/payment-verification.js";
import phonepeRoutes from "./routes/phonepe-sdk.js";
import settingsRoutes from "./routes/settings.js";
import paymentModeRoutes from "./routes/paymentMode.js";
import wishlistRoutes from "./routes/wishlist.js";
import shipmentRoutes from "./routes/shipment.js";

// Import corrected middleware
import { authMiddleware, adminMiddleware } from "./middleware/auth.js";

dotenv.config({ path: "../.env", override: true });

// ---------------------
// Init
// ---------------------
const __dirname = import.meta.dirname;
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV;

// Debug Redis connection
redisClient.on("connect", () => console.log("✅ Redis connected successfully"));
redisClient.on("error", (err) =>
  console.error("❌ Redis connection error:", err)
);

const redisStore = new RedisStore({
  client: redisClient,
  prefix: "sess:",
});

// ---------------------
// Security Middleware
// ---------------------
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        connectSrc: [
          "'self'",
          "https://api.iconify.design",
          "https://api.simplesvg.com",
          "https://api.unisvg.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "https://cdn.jsdelivr.net",
          "https://img.heroui.chat",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
      },
    },
  })
);

// ---------------------
// CORS
// ---------------------
app.use(
  cors({
    credentials: true,
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ---------------------
// Parsers
// ---------------------
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.set("trust proxy", 1);

// ---------------------
// Session configuration
// ---------------------
app.use(
  session({
    store: redisStore,
    name: "sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      ...(process.env.NODE_ENV === "production"
        ? { domain: ".duckdns.org" }
        : {}),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

// ---------------------
// Static uploads
// ---------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/uploads/profiles",
  express.static(path.join(__dirname, "uploads/profiles"))
);
app.use(
  "/uploads/products",
  express.static(path.join(__dirname, "uploads/products"))
);
app.use(
  "/uploads/categories",
  express.static(path.join(__dirname, "uploads/categories"))
);
app.use(
  "/uploads/payments",
  express.static(path.join(__dirname, "uploads/payments"))
);

// ---------------------
// Auth redirect middleware for login/register pages
// ---------------------
app.get("/login", (req, res) => {
  if (req.session.userId) {
    const isAdmin = req.session.isAdmin;
    return res.redirect(isAdmin ? "/admin" : "/");
  }
  res.redirect("/"); // Let frontend handle routing
});

app.get("/register", (req, res) => {
  if (req.session.userId) {
    const isAdmin = req.session.isAdmin;
    return res.redirect(isAdmin ? "/admin" : "/");
  }
  res.redirect("/"); // Let frontend handle routing
});

// ---------------------
// API Routes
// ---------------------
app.use("/api/auth", authRoutes); // Auth routes don't need the middleware
app.use("/api/profile", authMiddleware, profileRoutes);
app.use("/api/products", productRoutes); // Assuming some routes are public
app.use("/api/admin", authMiddleware, adminMiddleware, adminRoutes);
app.use("/api/cart", authMiddleware, cartRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/payment-verification", paymentVerificationRoutes);
app.use("/api/phonepe", phonepeRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/payment-mode", paymentModeRoutes);
app.use("/api/wishlist", authMiddleware, wishlistRoutes);
app.use("/api/shipment", shipmentRoutes);

// ---------------------
// Health check
// ---------------------
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Your Merchandise API is running fine" });
});

// ---------------------
// Serve React frontend (Reverse Proxy)
// ---------------------
const frontendPath = path.join(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendPath));

app.get("*", (req, res) => {
   res.sendFile(path.join(frontendPath, "index.html"));
});

// ---------------------
// Error handling middleware
// ---------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (!res.headersSent) {
    res
      .status(err.status || 500)
      .json({ error: err.message || "Internal Server Error" });
  }
});

app.get("/api/site-status", async (req, res) => {
  try {
    const closed = await redisClient.get("site_closed");
    res.json({ closed: closed === "1" });
  } catch (err) {
    console.error("Error fetching site status:", err);
    res.status(500).json({ closed: false });
  }
});

// ---------------------
// Start server
// ---------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});

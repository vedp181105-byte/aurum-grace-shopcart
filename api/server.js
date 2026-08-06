const path = require("path");
const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1", "9.9.9.9"]);
require("dotenv").config({
  path: path.resolve(__dirname, "../.env.local"),
});

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const cors = require("cors");

const connectDB = require("./config/db");
const apiRouter = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// Check environment variables
console.log("MONGO_URI:", process.env.MONGO_URI ? "Loaded ✅" : "Not Found ❌");
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN || "Not set - using default");

// Connect MongoDB
connectDB();

// ✅ CORS Fix
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3000',
    'https://aurum-grace-shopcart.vercel.app',
    process.env.CORS_ORIGIN,
  ].filter(Boolean),
  credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Session Fix - sameSite none + secure true for cross-domain
app.use(session({
  secret: process.env.SESSION_SECRET || "aurum-grace-secret",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 7 * 24 * 60 * 60,
    touchAfter: 24 * 3600,
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: "none",   // ✅ Changed from "lax"
    secure: true,        // ✅ Changed from conditional
  },
}));

// Routes
app.use("/api", apiRouter);

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "✦ Aurum & Grace API Running Successfully",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
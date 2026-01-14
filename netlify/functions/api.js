import express from "express";
import serverless from "serverless-http";
import cookieParser from "cookie-parser";

import routes from "./routes/index.js";
import { corsMiddleware } from "./middleware/cors.js";
import { securityHeadersMiddleware } from "./middleware/securityHeaders.js";
import { rateLimiterMiddleware } from "./middleware/rateLimiter.js";

import { sequelize, initializeDatabase } from "./models/index.js";

const app = express();

// Middleware
app.use(corsMiddleware);
app.options("*", corsMiddleware);

app.use(securityHeadersMiddleware);
app.use(express.json());
app.use(rateLimiterMiddleware);

app.use(cookieParser());

// Routes
app.use("/api", routes);

// ---- Boot DB once (no top-level await) ----
let bootPromise = null;

async function boot() {
  if (!bootPromise) {
    bootPromise = (async () => {
      await initializeDatabase();

      // ⚠️ For production, consider removing "alter: true"
      // It can cause unwanted schema changes.
      await sequelize.sync({ alter: true });

      console.log("✅ Database initialized + synced");
    })().catch((err) => {
      // If boot fails, allow retry on next invocation
      bootPromise = null;
      console.error("❌ DB startup failed:", err);
      throw err;
    });
  }
  return bootPromise;
}

const handlerBase = serverless(app);

export const handler = async (event, context) => {
  await boot();
  return handlerBase(event, context);
};
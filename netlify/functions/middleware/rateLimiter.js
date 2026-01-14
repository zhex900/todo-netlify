// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute per IP

export const rateLimiterMiddleware = (req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    "unknown";

  const now = Date.now();
  const key = `${ip}-${Math.floor(now / RATE_LIMIT_WINDOW)}`;

  const count = rateLimitMap.get(key) || 0;
  if (count >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
    });
  }

  rateLimitMap.set(key, count + 1);

  // Clean up old entries (simple cleanup)
  if (rateLimitMap.size > 1000) {
    const cutoff = Math.floor(
      (now - RATE_LIMIT_WINDOW * 2) / RATE_LIMIT_WINDOW
    );
    for (const [k] of rateLimitMap) {
      const keyTime = parseInt(k.split("-")[1]);
      if (keyTime < cutoff) {
        rateLimitMap.delete(k);
      }
    }
  }

  next();
};

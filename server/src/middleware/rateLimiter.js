const { fail } = require('../utils/apiResponse');

/**
 * Simple in-memory sliding-window rate limiter.
 *
 * No external dependencies — suitable for a single-process hackathon server.
 * For production with multiple workers, swap in `express-rate-limit` + Redis.
 *
 * @param {object} opts
 * @param {number} opts.windowMs  Time window in milliseconds (default: 15 min)
 * @param {number} opts.max       Max requests per window per IP  (default: 20)
 * @param {string} [opts.message] Custom message on limit exceeded
 * @returns {import('express').RequestHandler}
 */
const rateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 20,
  message = 'Too many requests. Please try again later.',
} = {}) => {
  /** @type {Map<string, { count: number, resetAt: number }>} */
  const hits = new Map();

  // Periodic cleanup so the map doesn't grow unbounded
  const CLEANUP_INTERVAL = 60 * 1000; // 1 min
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) {
      if (now >= entry.resetAt) hits.delete(key);
    }
  }, CLEANUP_INTERVAL);
  // Allow the process to exit even if the interval is still running
  if (cleanup.unref) cleanup.unref();

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    let entry = hits.get(key);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      hits.set(key, entry);
    } else {
      entry.count += 1;
    }

    // Set standard rate-limit headers
    const remaining = Math.max(0, max - entry.count);
    res.set('X-RateLimit-Limit', String(max));
    res.set('X-RateLimit-Remaining', String(remaining));
    res.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
      return fail(res, { statusCode: 429, message });
    }

    next();
  };
};

const config = require('../config');
const isDev = config.nodeEnv === 'development';

// ── Pre-built limiters ─────────────────────────────────────

/** Auth endpoints: 500 req in dev / 15 in prod */
const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 15,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
});

/** General API: 1000 req in dev / 100 in prod */
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 5000 : 100,
  message: 'Too many requests. Please slow down.',
});

module.exports = { rateLimiter, authLimiter, apiLimiter };

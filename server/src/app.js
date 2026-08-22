const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// ── Trust proxy (needed for correct req.ip behind reverse proxy)
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────
app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '0'); // modern browsers — rely on CSP instead
  if (config.nodeEnv === 'production') {
    res.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// ── Global middleware ──────────────────────────────
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Global rate limiter ────────────────────────────
app.use('/api', apiLimiter);

// ── Request logger (dev only) ──────────────────────
if (config.nodeEnv === 'development') {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
}

// ── API routes ─────────────────────────────────────
app.use('/api', routes);

// ── Catch-all & error handling ─────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;


const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ── Global middleware ──────────────────────────────
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

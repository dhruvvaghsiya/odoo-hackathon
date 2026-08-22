const app = require('./app');
const config = require('./config');
const { testConnection } = require('./config/db');

const start = async () => {
  // ── Verify database connectivity ─────────────────
  try {
    await testConnection();
    console.log('[DB]     PostgreSQL connected');
  } catch (err) {
    console.error('[DB]     PostgreSQL connection failed:', err.message);
    console.warn('[DB]     Server will start, but database features will be unavailable');
  }

  // ── Start listening ──────────────────────────────
  app.listen(config.port, () => {
    console.log(`[SERVER] Running in ${config.nodeEnv} mode`);
    console.log(`[SERVER] Listening on http://localhost:${config.port}`);
    console.log(`[SERVER] Health check → http://localhost:${config.port}/api/health`);
  });
};

start();

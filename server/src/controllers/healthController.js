const { testConnection } = require('../config/db');
const { success, fail } = require('../utils/apiResponse');

/**
 * GET /api/health
 * Returns server + database status.
 */
const getHealth = async (_req, res, next) => {
  try {
    const dbOk = await testConnection();

    return success(res, {
      message: 'Server is healthy',
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: dbOk ? 'connected' : 'disconnected',
      },
    });
  } catch (err) {
    // DB unreachable — still return a 200 so load-balancers know
    // the process itself is alive, but flag the DB issue.
    return fail(res, {
      statusCode: 503,
      message: 'Database connection failed',
      error: err.message,
    });
  }
};

module.exports = { getHealth };

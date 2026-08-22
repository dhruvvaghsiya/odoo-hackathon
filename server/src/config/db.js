const { Pool } = require('pg');
const config = require('./index');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  // Pool tuning
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Log pool errors so they don't crash the process
pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

/**
 * Run a single query.
 * @param {string} text  SQL string (parameterised with $1, $2, …)
 * @param {any[]}  params
 * @returns {Promise<import('pg').QueryResult>}
 */
const query = (text, params) => pool.query(text, params);

/**
 * Grab a client from the pool for transactions.
 * Always call client.release() when done.
 * @returns {Promise<import('pg').PoolClient>}
 */
const getClient = () => pool.connect();

/**
 * Quick connectivity check (used by /api/health).
 * @returns {Promise<boolean>}
 */
const testConnection = async () => {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
};

module.exports = { pool, query, getClient, testConnection };

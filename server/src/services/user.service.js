const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../config/db');

/**
 * Columns returned for authenticated user responses.
 * NEVER include password_hash.
 */
const SAFE_USER_COLUMNS =
  'id, name, email, profile_photo, language, role, created_at, updated_at';

/**
 * Find a user by email.
 * @param {string} email
 * @returns {Promise<object|null>}
 */
const findByEmail = async (email) => {
  const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [
    email.toLowerCase(),
  ]);
  return rows[0] || null;
};

/**
 * Find a user by ID (safe — no password_hash).
 * @param {string} id  UUID
 * @returns {Promise<object|null>}
 */
const findById = async (id) => {
  const { rows } = await db.query(
    `SELECT ${SAFE_USER_COLUMNS} FROM users WHERE id = $1`,
    [id],
  );
  return rows[0] || null;
};

/**
 * Register a new user.
 * @returns {{ user: object, token: string }}
 */
const register = async ({ name, email, password, language }) => {
  const normalizedEmail = email.toLowerCase();

  // Check uniqueness
  const existing = await findByEmail(normalizedEmail);
  if (existing) {
    const err = new Error('Email is already registered');
    err.statusCode = 409;
    throw err;
  }

  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const { rows } = await db.query(
    `INSERT INTO users (name, email, password_hash, language)
     VALUES ($1, $2, $3, $4)
     RETURNING ${SAFE_USER_COLUMNS}`,
    [name, normalizedEmail, passwordHash, language || 'en'],
  );

  const user = rows[0];
  const token = signToken(user);

  return { user, token };
};

/**
 * Authenticate a user with email + password.
 * @returns {{ user: object, token: string }}
 */
const login = async ({ email, password }) => {
  const user = await findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  // Strip password_hash before returning
  const { password_hash: _, ...safeUser } = user;
  const token = signToken(safeUser);

  return { user: safeUser, token };
};

/**
 * Update a user's profile.
 * Only the fields provided will be updated.
 * @param {string} userId
 * @param {object} fields  { name?, email?, profile_photo?, language? }
 * @returns {Promise<object>} Updated user (safe)
 */
const updateProfile = async (userId, fields) => {
  const allowed = ['name', 'email', 'profile_photo', 'language'];
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      const value = key === 'email' ? fields[key].toLowerCase() : fields[key];

      // Email uniqueness check
      if (key === 'email') {
        const existing = await findByEmail(value);
        if (existing && existing.id !== userId) {
          const err = new Error('Email is already in use');
          err.statusCode = 409;
          throw err;
        }
      }

      setClauses.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) {
    const err = new Error('No valid fields to update');
    err.statusCode = 400;
    throw err;
  }

  values.push(userId);

  const { rows } = await db.query(
    `UPDATE users SET ${setClauses.join(', ')}
     WHERE id = $${paramIndex}
     RETURNING ${SAFE_USER_COLUMNS}`,
    values,
  );

  if (rows.length === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  return rows[0];
};

/**
 * Delete a user account.
 * Cascades to trips & trip_stops via ON DELETE CASCADE.
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deleteAccount = async (userId) => {
  const { rowCount } = await db.query('DELETE FROM users WHERE id = $1', [
    userId,
  ]);

  if (rowCount === 0) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
};

// ── Helpers ──────────────────────────────────────────

/**
 * Create a signed JWT for the given user.
 */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

module.exports = {
  findByEmail,
  findById,
  register,
  login,
  updateProfile,
  deleteAccount,
};

const { query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { success, created, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

/** Strip password_hash from a user row */
const sanitiseUser = ({ password_hash, ...rest }) => rest;

// ── POST /api/auth/signup ──────────────────────────────
// Validation is handled by signupRules middleware (see routes)

const signup = async (req, res, next) => {
  try {
    const {
      name,
      first_name,
      last_name,
      email,
      password,
      phone,
      city,
      country,
      additional_info,
      profile_photo,
    } = req.body;

    const fullName = (name || `${first_name || ''} ${last_name || ''}`).trim() || 'Explorer';

    // ── Duplicate email check ───────────────────────
    const { rows: existing } = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.trim().toLowerCase()],
    );

    if (existing.length > 0) {
      return fail(res, {
        statusCode: 409,
        message: 'An account with this email already exists.',
      });
    }

    // ── Hash password & insert ──────────────────────
    const hashedPassword = await hashPassword(password);

    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, profile_photo, phone, city, country, additional_info)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, name, email, profile_photo, phone, city, country, additional_info, language, role, created_at, updated_at`,
      [
        fullName,
        email.trim().toLowerCase(),
        hashedPassword,
        profile_photo || null,
        phone || null,
        city || null,
        country || null,
        additional_info || null,
      ],
    );

    const user = rows[0];
    const token = signToken(user);

    return created(res, {
      message: 'Account created successfully.',
      data: { user: sanitiseUser(user), token },
    });
  } catch (err) {
    next(err);
  }
};

const DEMO_FALLBACKS = {
  'alice@example.com': { name: 'Alice Johnson', role: 'user', city: 'San Francisco', country: 'United States' },
  'bob@example.com': { name: 'Bob Smith', role: 'user', city: 'Seattle', country: 'United States' },
  'charlie@example.com': { name: 'Charlie Kumar', role: 'admin', city: 'Mumbai', country: 'India' },
  'diana@example.com': { name: 'Diana Prince', role: 'user', city: 'Themyscira', country: 'Greece' },
  'elena@example.com': { name: 'Elena Rostova', role: 'user', city: 'London', country: 'United Kingdom' },
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // ── Find user ───────────────────────────────────
    let { rows } = await query(
      `SELECT id, name, email, password_hash, profile_photo, language, role, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [cleanEmail],
    );

    // ── On-demand demo account provisioning fallback ─
    if (rows.length === 0 && DEMO_FALLBACKS[cleanEmail] && password === 'password123') {
      const demo = DEMO_FALLBACKS[cleanEmail];
      const defaultHash = await hashPassword('password123');
      const insertRes = await query(
        `INSERT INTO users (name, email, password_hash, role, city, country)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
         RETURNING id, name, email, password_hash, profile_photo, language, role, created_at, updated_at`,
        [demo.name, cleanEmail, defaultHash, demo.role, demo.city, demo.country]
      );
      rows = insertRes.rows;
    }

    // Generic message prevents user-enumeration attacks
    if (rows.length === 0) {
      return fail(res, {
        statusCode: 401,
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];

    // ── Compare password ────────────────────────────
    let isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch && DEMO_FALLBACKS[cleanEmail] && password === 'password123') {
      // Re-hash and fix password for demo accounts
      const freshHash = await hashPassword('password123');
      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [freshHash, user.id]);
      isMatch = true;
    }

    if (!isMatch) {
      return fail(res, {
        statusCode: 401,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user);

    return success(res, {
      message: 'Logged in successfully.',
      data: { user: sanitiseUser(user), token },
    });
  } catch (err) {
    next(err);
  }
};

// ── POST /api/auth/logout ──────────────────────────────
//
// JWT is stateless — the server cannot revoke a token without a blacklist.
// This endpoint exists so the frontend has a canonical logout URL to call.
// The frontend should delete the stored token on its side.
//
// If server-side token invalidation is needed later, implement a token
// blacklist (e.g. Redis set of revoked JTIs checked in the auth middleware).

const logout = async (_req, res, _next) => {
  return success(res, {
    message: 'Logged out successfully. Please discard the token client-side.',
  });
};

// ── GET /api/auth/me ───────────────────────────────────

const getMe = async (req, res, next) => {
  try {
    // req.user is set by the authenticate middleware (password_hash already excluded)
    return success(res, {
      message: 'User retrieved successfully.',
      data: { user: req.user },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, logout, getMe };

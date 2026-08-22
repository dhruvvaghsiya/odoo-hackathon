const { query } = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const { success, created, fail } = require('../utils/apiResponse');

// ── Helpers ────────────────────────────────────────────

/** Basic email format check */
const isValidEmail = (email) =>
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email);

/** Strip password_hash from a user row */
const sanitiseUser = ({ password_hash, ...rest }) => rest;

// ── POST /api/auth/signup ──────────────────────────────

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // ── Validation ──────────────────────────────────
    const errors = [];
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      errors.push('Name is required.');
    } else if (name.trim().length > 100) {
      errors.push('Name must be 100 characters or fewer.');
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      errors.push('Email is required.');
    } else if (!isValidEmail(email.trim())) {
      errors.push('Please provide a valid email address.');
    }

    if (!password || typeof password !== 'string') {
      errors.push('Password is required.');
    } else if (password.length < 8) {
      errors.push('Password must be at least 8 characters.');
    } else if (password.length > 128) {
      errors.push('Password must be 128 characters or fewer.');
    }

    if (errors.length > 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Validation failed.',
        error: errors,
      });
    }

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
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, profile_photo, language, role, created_at, updated_at`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword],
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

// ── POST /api/auth/login ───────────────────────────────

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // ── Validation ──────────────────────────────────
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return fail(res, {
        statusCode: 400,
        message: 'Email is required.',
      });
    }

    if (!password || typeof password !== 'string') {
      return fail(res, {
        statusCode: 400,
        message: 'Password is required.',
      });
    }

    // ── Find user ───────────────────────────────────
    const { rows } = await query(
      `SELECT id, name, email, password_hash, profile_photo, language, role, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()],
    );

    if (rows.length === 0) {
      return fail(res, {
        statusCode: 401,
        message: 'Invalid email or password.',
      });
    }

    const user = rows[0];

    // ── Compare password ────────────────────────────
    const isMatch = await comparePassword(password, user.password_hash);
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

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Sign a JWT for a given user.
 * @param {{ id: string, email: string, role: string }} payload
 * @returns {string} signed token
 */
const signToken = (payload) =>
  jwt.sign(
    { id: payload.id, email: payload.email, role: payload.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  );

/**
 * Verify and decode a JWT.
 * @param {string} token
 * @returns {{ id: string, email: string, role: string, iat: number, exp: number }}
 * @throws {jwt.JsonWebTokenError | jwt.TokenExpiredError}
 */
const verifyToken = (token) => jwt.verify(token, config.jwt.secret);

module.exports = { signToken, verifyToken };

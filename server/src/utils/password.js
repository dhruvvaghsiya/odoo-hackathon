const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password.
 * @param {string} plaintext
 * @returns {Promise<string>} bcrypt hash
 */
const hashPassword = (plaintext) => bcrypt.hash(plaintext, SALT_ROUNDS);

/**
 * Compare a plaintext password against a bcrypt hash.
 * @param {string} plaintext
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = (plaintext, hash) => bcrypt.compare(plaintext, hash);

module.exports = { hashPassword, comparePassword };

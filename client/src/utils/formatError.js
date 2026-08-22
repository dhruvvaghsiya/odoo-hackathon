/**
 * Formats API errors, HTTP responses, or thrown exceptions into
 * user-friendly, human-readable messages.
 * Prevents raw technical exceptions from ever reaching the user.
 *
 * @param {any} error  Error object, string, or Axios response error
 * @param {string} [fallback] Default message to use if no specific rule matches
 * @returns {string} Clean, descriptive error message
 */
export function formatErrorMessage(error, fallback = 'An unexpected error occurred. Please try again.') {
  if (!error) return fallback;

  // If passed an array of validation errors (express-validator)
  if (Array.isArray(error)) {
    return error.map((e) => e.msg || e.message || String(e)).join(' ');
  }

  // If already a clean user string without technical gibberish
  if (typeof error === 'string') {
    return sanitizeTechnicalText(error, fallback);
  }

  // Handle Axios / API error structure
  const status = error.status || error.response?.status;
  const data = error.response?.data || error.data;
  const rawMsg = error.message || data?.message || data?.error;

  // Check for express-validator array in response data
  if (data?.errors && Array.isArray(data.errors)) {
    return data.errors.map((e) => e.msg || e.message).join('. ');
  }

  // Known HTTP Status code mappings
  if (status === 400) {
    if (rawMsg && isCleanUserMessage(rawMsg)) return sanitizeTechnicalText(rawMsg, 'Invalid request data.');
    return 'Please check the details entered and try again.';
  }

  if (status === 401) {
    if (rawMsg && isCleanUserMessage(rawMsg)) return rawMsg;
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (status === 403) {
    return 'You do not have permission to access or modify this resource.';
  }

  if (status === 404) {
    return 'The requested page, trip, or destination could not be found.';
  }

  if (status === 409) {
    if (rawMsg && isCleanUserMessage(rawMsg)) return rawMsg;
    return 'An account or record with this information already exists.';
  }

  if (status === 422) {
    return 'Some required fields are missing or invalid. Please check your entries.';
  }

  if (status === 429) {
    return 'Too many attempts. Please wait a moment before trying again.';
  }

  if (status >= 500) {
    return 'The server encountered an issue processing your request. Please try again shortly.';
  }

  // Network / Offline errors
  if (error.code === 'ERR_NETWORK' || rawMsg?.toLowerCase().includes('network error')) {
    return 'Unable to connect to GlobeTrotter server. Please check your internet connection.';
  }

  if (error.code === 'ECONNABORTED' || rawMsg?.toLowerCase().includes('timeout')) {
    return 'Request timed out. Please try again.';
  }

  // Fallback sanitization
  if (rawMsg) {
    return sanitizeTechnicalText(rawMsg, fallback);
  }

  return fallback;
}

/**
 * Checks if a string is a clean user message or contains technical artifacts
 */
function isCleanUserMessage(str) {
  if (!str || typeof str !== 'string') return false;
  const technicalPatterns = [
    /TypeError/i,
    /ReferenceError/i,
    /SyntaxError/i,
    /is not a function/i,
    /cannot read propert/i,
    /undefined/i,
    /null/i,
    /SELECT /i,
    /INSERT INTO/i,
    /UPDATE /i,
    /DELETE FROM/i,
    /psql/i,
    /pg_/i,
    /at [A-Za-z0-9_.]+\s+\(/i,
    /node_modules/i,
    /ECONNREFUSED/i,
    /\.js:\d+/i,
  ];

  return !technicalPatterns.some((pattern) => pattern.test(str));
}

/**
 * Strips technical stack or SQL details from message
 */
function sanitizeTechnicalText(text, fallback) {
  if (!isCleanUserMessage(text)) {
    return fallback || 'Unable to complete the action. Please check your inputs and try again.';
  }
  return text.trim();
}

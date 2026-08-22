/**
 * 404 catch-all middleware.
 * Placed after all route definitions.
 */
const notFound = (req, res, _next) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    data: null,
    error: null,
  });
};

module.exports = notFound;

/**
 * Async Handler Wrapper
 * Wraps async route handlers to automatically catch and forward errors to error middleware
 * This eliminates the need for try-catch blocks in every route handler
 * 
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped function that catches errors
 * 
 * @example
 * const getUsers = asyncHandler(async (req, res) => {
 *   const users = await pool.query('SELECT * FROM users');
 *   res.json(users.rows);
 * });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;

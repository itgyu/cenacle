/**
 * Shared Lambda Utilities
 * Central export for all shared modules
 */

const cors = require('./cors');
const auth = require('./auth');
const response = require('./response');
const validation = require('./validation');

module.exports = {
  // CORS utilities
  ...cors,

  // Auth utilities
  ...auth,

  // Response helpers
  response,

  // Validation helpers
  validation,
};

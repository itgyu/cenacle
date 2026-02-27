/**
 * Standard Response Module
 * Consistent API response formatting
 */
const { getCorsHeaders } = require('./cors');

/**
 * Create a success response
 * @param {Object} data - Response data
 * @param {string} origin - Request origin for CORS
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Lambda response object
 */
function success(data, origin = '', statusCode = 200) {
  return {
    statusCode,
    headers: getCorsHeaders(origin),
    body: JSON.stringify(data),
  };
}

/**
 * Create an error response
 * @param {string} message - Error message
 * @param {string} origin - Request origin for CORS
 * @param {number} statusCode - HTTP status code (default: 400)
 * @param {string} code - Error code (optional)
 * @returns {Object} Lambda response object
 */
function error(message, origin = '', statusCode = 400, code = null) {
  const body = { error: message };
  if (code) {
    body.code = code;
  }

  return {
    statusCode,
    headers: getCorsHeaders(origin),
    body: JSON.stringify(body),
  };
}

/**
 * Create a 401 Unauthorized response
 * @param {string} message - Error message
 * @param {string} origin - Request origin for CORS
 * @returns {Object}
 */
function unauthorized(message = 'Unauthorized', origin = '') {
  return error(message, origin, 401, 'UNAUTHORIZED');
}

/**
 * Create a 403 Forbidden response
 * @param {string} message - Error message
 * @param {string} origin - Request origin for CORS
 * @returns {Object}
 */
function forbidden(message = 'Forbidden', origin = '') {
  return error(message, origin, 403, 'FORBIDDEN');
}

/**
 * Create a 404 Not Found response
 * @param {string} message - Error message
 * @param {string} origin - Request origin for CORS
 * @returns {Object}
 */
function notFound(message = 'Not found', origin = '') {
  return error(message, origin, 404, 'NOT_FOUND');
}

/**
 * Create a 500 Internal Server Error response
 * @param {string} message - Error message
 * @param {string} origin - Request origin for CORS
 * @returns {Object}
 */
function serverError(message = 'Internal server error', origin = '') {
  return error(message, origin, 500, 'SERVER_ERROR');
}

/**
 * Create a 409 Conflict response
 * @param {string} message - Error message
 * @param {string} origin - Request origin for CORS
 * @returns {Object}
 */
function conflict(message = 'Conflict', origin = '') {
  return error(message, origin, 409, 'CONFLICT');
}

/**
 * Create a 201 Created response
 * @param {Object} data - Response data
 * @param {string} origin - Request origin for CORS
 * @returns {Object}
 */
function created(data, origin = '') {
  return success(data, origin, 201);
}

module.exports = {
  success,
  error,
  unauthorized,
  forbidden,
  notFound,
  serverError,
  conflict,
  created,
};

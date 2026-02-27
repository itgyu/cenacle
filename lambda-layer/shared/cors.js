/**
 * CORS Configuration Module
 * Restricts access to allowed origins only
 */

// Production allowed origins
const ALLOWED_ORIGINS = ['https://cenacledesign.vercel.app', 'https://www.cenacledesign.com'];

// Development origins (only in non-production)
const DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

/**
 * Get allowed origins based on environment
 */
function getAllowedOrigins() {
  if (process.env.NODE_ENV === 'production' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    // In production, only allow specific domains
    return ALLOWED_ORIGINS;
  }
  // In development, also allow localhost
  return [...ALLOWED_ORIGINS, ...DEV_ORIGINS];
}

/**
 * Check if origin is allowed
 * @param {string} origin - The origin to check
 * @returns {boolean}
 */
function isAllowedOrigin(origin) {
  if (!origin) {
    return false;
  }
  return getAllowedOrigins().includes(origin);
}

/**
 * Get CORS headers for a request
 * @param {string} origin - The request origin
 * @param {string[]} methods - Allowed HTTP methods
 * @returns {Object} CORS headers
 */
function getCorsHeaders(origin, methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']) {
  const allowedOrigins = getAllowedOrigins();
  const allowedOrigin = isAllowedOrigin(origin) ? origin : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': methods.join(', '),
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json',
  };
}

/**
 * Handle OPTIONS preflight request
 * @param {Object} event - Lambda event object
 * @returns {Object|null} Response for OPTIONS request, or null if not OPTIONS
 */
function handlePreflight(event) {
  if (event.httpMethod === 'OPTIONS') {
    const origin = event.headers?.origin || event.headers?.Origin || '';
    return {
      statusCode: 200,
      headers: getCorsHeaders(origin),
      body: '',
    };
  }
  return null;
}

module.exports = {
  ALLOWED_ORIGINS,
  getAllowedOrigins,
  isAllowedOrigin,
  getCorsHeaders,
  handlePreflight,
};

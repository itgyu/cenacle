/**
 * Authentication Module
 * JWT verification and token management
 */
const jwt = require('jsonwebtoken');

/**
 * Get JWT secret from environment
 * Throws error if not configured in production
 * @returns {string}
 */
function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  // Warn if using default secret (should never happen in production)
  if (secret === 'your-secret-key-change-this') {
    console.error('[SECURITY WARNING] Using default JWT secret. Change this immediately!');
    if (process.env.NODE_ENV === 'production' || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw new Error('Cannot use default JWT secret in production');
    }
  }

  return secret;
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload, or null if invalid
 */
function verifyToken(token) {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return null;
  }
}

/**
 * Generate JWT token
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiration (default: '7d')
 * @returns {string}
 */
function generateToken(payload, expiresIn = '7d') {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn });
}

/**
 * Extract token from Authorization header
 * @param {Object} headers - Request headers
 * @returns {string|null}
 */
function extractToken(headers) {
  const authHeader = headers?.Authorization || headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Authenticate request and return user info
 * @param {Object} event - Lambda event object
 * @returns {{user: Object|null, error: string|null}}
 */
function authenticateRequest(event) {
  const token = extractToken(event.headers);

  if (!token) {
    return { user: null, error: 'No token provided' };
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return { user: null, error: 'Invalid token' };
  }

  return { user: decoded, error: null };
}

module.exports = {
  getJwtSecret,
  verifyToken,
  generateToken,
  extractToken,
  authenticateRequest,
};

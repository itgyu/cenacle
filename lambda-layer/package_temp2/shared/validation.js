/**
 * Input Validation Module
 * Common validation functions for API inputs
 */

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password
 * @param {number} minLength - Minimum length (default: 6)
 * @returns {{valid: boolean, error?: string}}
 */
function validatePassword(password, minLength = 6) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Password must be at least ${minLength} characters` };
  }

  return { valid: true };
}

/**
 * Validate required fields in an object
 * @param {Object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {{valid: boolean, missingFields: string[]}}
 */
function validateRequiredFields(data, requiredFields) {
  if (!data || typeof data !== 'object') {
    return { valid: false, missingFields: requiredFields };
  }

  const missingFields = requiredFields.filter((field) => {
    const value = data[field];
    return value === undefined || value === null || value === '';
  });

  return {
    valid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Sanitize string input
 * @param {string} str - String to sanitize
 * @param {number} maxLength - Maximum length (default: 1000)
 * @returns {string}
 */
function sanitizeString(str, maxLength = 1000) {
  if (!str || typeof str !== 'string') {
    return '';
  }

  return str.trim().substring(0, maxLength);
}

/**
 * Validate and parse JSON body from Lambda event
 * @param {Object} event - Lambda event object
 * @returns {{data: Object|null, error: string|null}}
 */
function parseJsonBody(event) {
  if (!event.body) {
    return { data: null, error: 'Request body is required' };
  }

  try {
    const data = JSON.parse(event.body);
    return { data, error: null };
  } catch (e) {
    return { data: null, error: 'Invalid JSON in request body' };
  }
}

module.exports = {
  isValidEmail,
  validatePassword,
  validateRequiredFields,
  sanitizeString,
  parseJsonBody,
};

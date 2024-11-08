// invariant.js

/**
 * This function is used to enforce a certain condition in your application.
 * If the condition is not met, it throws an error.
 * During development (when NODE_ENV is not 'production'), it provides a detailed error message, 
 * but in production, to avoid leaking potentially sensitive information, it throws a generic error message.
 *
 * @param {boolean} condition - The condition to evaluate.
 * @param {string} message - The message to display if the condition is false and not in production.
 */
function invariant(condition, message) {
  if (!condition) {
    // Check if the current environment is not production
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    // Throw an error with a detailed message in development or a generic message in production
    const errorMessage = isDevelopment ? 
      `Invariant Violation: ${message || 'A falsy condition has triggered an error.'}` :
      'Invariant Violation';

    throw new Error(errorMessage);
  }
}

module.exports = invariant;

// Usage example:
// Ensure you import this module where you need to use it:
// const invariant = require('./invariant');

// Example in a non-production environment (development, testing, etc.):
// This will throw an error with the provided message
// invariant(false, 'This condition failed.');

// Example in a production environment (set process.env.NODE_ENV = 'production'):
// This will throw an error with a generic message
// invariant(false);

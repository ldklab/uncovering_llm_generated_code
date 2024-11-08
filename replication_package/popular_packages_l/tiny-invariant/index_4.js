// invariant.js

/**
 * Throws an error if the specified condition is not met.
 * The error message can be customized based on the environment.
 *
 * @param {boolean} condition - The condition to evaluate.
 * @param {string|function} message - The error message or function returning a message.
 * 
 * Throws an error with the provided message in non-production environments, 
 * or a generic message in production environments.
 */
function invariant(condition, message) {
  if (!condition) {
    // Determine if the message is a function, and call it if it is
    const isFunction = typeof message === 'function';
    const errorMessage = isFunction ? message() : message || 'Invariant violation';

    // Throw a detailed error in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Invariant violation: ${errorMessage}`);
    }
    
    // Throw a generic error message in production environments
    throw new Error('Invariant violation');
  }
}

module.exports = invariant;

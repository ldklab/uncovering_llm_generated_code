'use strict';

// Determine if the application is running in production mode
const isProduction = process.env.NODE_ENV === 'production';
const prefix = 'Invariant failed';

/**
 * Checks the given condition. If the condition is false, an error is thrown.
 * In production, a generic error message is used. Otherwise, a custom message can be provided.
 * @param {boolean} condition - The condition to evaluate
 * @param {string|function} message - The message to supply if the condition fails, can be a string or a function returning a string
 */
function invariant(condition, message) {
    // If the condition is true, no action is needed
    if (condition) {
        return;
    }
    
    // Generate and throw an error message based on the environment
    if (isProduction) {
        throw new Error(prefix);
    }
    
    // Get the error message, calling the function if provided
    const providedMessage = typeof message === 'function' ? message() : message;
    const errorMessage = providedMessage ? `${prefix}: ${providedMessage}` : prefix;
    throw new Error(errorMessage);
}

module.exports = invariant;

'use strict';

// Determine the environment: production or not
const isProduction = process.env.NODE_ENV === 'production';
const errorPrefix = 'Invariant failed';

// Invariant function to ensure conditions at runtime
function invariant(condition, message) {
    if (condition) {
        return; // If condition is true, do nothing
    }
    if (isProduction) {
        // Throw a generic error in production
        throw new Error(errorPrefix);
    }
    // Determine the error message: execute if function, else use as is
    const providedMessage = typeof message === 'function' ? message() : message;
    const completeMessage = providedMessage ? `${errorPrefix}: ${providedMessage}` : errorPrefix;
    
    // Throw the descriptive error in non-production environments
    throw new Error(completeMessage);
}

// Export the invariant function
module.exports = invariant;

// invariant.js
function invariant(condition, message) {
  if (!condition) {
    const errorMessage = process.env.NODE_ENV === 'production' 
      ? 'Invariant Violation' 
      : `Invariant Violation: ${message || 'A falsy condition has triggered an error.'}`;
    
    throw new Error(errorMessage);
  }
}

module.exports = invariant;

// Usage example
// const invariant = require('./invariant');

// In development:
// invariant(false, 'This condition failed.');  // Error with detailed message

// In production (simulate by setting process.env.NODE_ENV = 'production'):
// invariant(false);  // Generic error message

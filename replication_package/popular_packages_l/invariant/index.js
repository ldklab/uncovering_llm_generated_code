// invariant.js
function invariant(condition, message) {
  if (!condition) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Invariant Violation: ${message || 'A falsy condition has triggered an error.'}`);
    } else {
      throw new Error('Invariant Violation');
    }
  }
}

module.exports = invariant;

// Usage example
// const invariant = require('./invariant');

// In development:
// invariant(false, 'This condition failed.');  // Error with detailed message

// In production (simulate by setting process.env.NODE_ENV = 'production'):
// invariant(false);  // Generic error message

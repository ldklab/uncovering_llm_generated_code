// index.js

function invariant(condition, message) {
  if (!condition) {
    const errorMessage = typeof message === 'function' ? message() : message || 'Invariant violation';

    throw new Error(
      process.env.NODE_ENV !== 'production' ? `Invariant violation: ${errorMessage}` : 'Invariant violation'
    );
  }
}

module.exports = invariant;

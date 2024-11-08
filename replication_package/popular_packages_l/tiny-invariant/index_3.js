// index.js

function invariant(condition, message) {
  if (!condition) {
    const errorMessage = typeof message === 'function' ? message() : message || 'Invariant violation';

    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Invariant violation: ${errorMessage}`);
    } else {
      throw new Error('Invariant violation');
    }
  }
}

module.exports = invariant;

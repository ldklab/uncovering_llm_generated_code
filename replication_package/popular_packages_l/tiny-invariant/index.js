// index.js

function invariant(condition, message) {
  if (!condition) {
    // if message is a function, call it to get the actual message 
    const isFn = typeof message === 'function';
    const errorMessage = isFn ? message() : message || 'Invariant violation';
    
    // in development mode, throw an error with message
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(`Invariant violation: ${errorMessage}`);
    } else { // in production mode, only display generic message
      throw new Error('Invariant violation');
    }
  }
}

module.exports = invariant;

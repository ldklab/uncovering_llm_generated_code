'use strict';

const NODE_ENV = process.env.NODE_ENV;

function invariant(condition, format, ...args) {
  if (NODE_ENV !== 'production') {
    if (!format) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    let error;
    if (!format) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      let argIndex = 0;
      error = new Error(
        format.replace(/%s/g, () => args[argIndex++])
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // Omit the function's own frame from the stack trace
    throw error;
  }
}

module.exports = invariant;
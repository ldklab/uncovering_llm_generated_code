'use strict';

const { NODE_ENV } = process.env;

// The invariant function checks a condition and throws an error with a message if the condition is not met.
// It can optionally format and include additional information in the error message using sprintf-style placeholders (%s).
function invariant(condition, format, a, b, c, d, e, f) {
  if (NODE_ENV !== 'production') {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    let error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      const args = [a, b, c, d, e, f];
      let argIndex = 0;
      error = new Error(
        format.replace(/%s/g, () => args[argIndex++])
      );
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1;
    throw error;
  }
}

module.exports = invariant;

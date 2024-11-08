'use strict';

const NODE_ENV = process.env.NODE_ENV;

const invariant = (condition, format, ...args) => {
  if (NODE_ENV !== 'production' && format === undefined) {
    throw new Error('invariant requires an error message argument');
  }
  
  if (!condition) {
    let error;
    if (format === undefined) {
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

    error.framesToPop = 1;
    throw error;
  }
};

module.exports = invariant;

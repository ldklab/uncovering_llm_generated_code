'use strict';

function checkDCE() {
  if (
    typeof globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
    typeof globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
  ) {
    return;
  }
  if (process.env.NODE_ENV !== 'production') {
    // This code is meant to show whether the function's development branch was removed in production
    throw new Error('^_^');
  }
  try {
    globalThis.__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDCE);
  } catch (err) {
    console.error(err);
  }
}

if (process.env.NODE_ENV === 'production') {
  checkDCE();
  module.exports = require('./cjs/react-dom.production.min.js');
} else {
  module.exports = require('./cjs/react-dom.development.js');
}

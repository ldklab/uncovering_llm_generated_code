'use strict';

function checkDeadCodeElimination() {
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function') {
    return;
  }
  
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('^_^');
  }

  try {
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDeadCodeElimination);
  } catch (error) {
    console.error(error);
  }
}

if (process.env.NODE_ENV === 'production') {
  checkDeadCodeElimination();
  module.exports = require('./cjs/react-dom.production.min.js');
} else {
  module.exports = require('./cjs/react-dom.development.js');
}

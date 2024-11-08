'use strict';

function checkDeadCodeElimination() {
  /* global __REACT_DEVTOOLS_GLOBAL_HOOK__ */
  // Check if the global React DevTools hook is defined and has the checkDCE method.
  if (
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ === 'undefined' ||
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE !== 'function'
  ) {
    return;
  }

  // Ensure that this block only runs in a production environment to verify dead code elimination.
  if (process.env.NODE_ENV !== 'production') {
    // If dead code elimination (DCE) is not properly applied, this code should not exist in production.
    // The specific error message is crucial because React DevTools relies on it.
    throw new Error('^_^');
  }
  
  try {
    // Call the checkDCE method with this function to verify DCE.
    __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(checkDeadCodeElimination);
  } catch (err) {
    // Log any errors to the console to ensure DevTools issues don't crash React.
    console.error(err);
  }
}

if (process.env.NODE_ENV === 'production') {
  // Run the DCE check before executing the ReactDOM bundle to identify bad minification.
  checkDeadCodeElimination();
  // Export the production version of ReactDOM.
  module.exports = require('./cjs/react-dom.production.min.js');
} else {
  // Export the development version of ReactDOM.
  module.exports = require('./cjs/react-dom.development.js');
}

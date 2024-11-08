"use strict";

// Ensure that the exports module has the exports property that references an object with the property default.
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Import the declare function from '@babel/helper-plugin-utils'.
var _helperPluginUtils = require("@babel/helper-plugin-utils");

/**
 * This module exports a Babel plugin that transforms ES6 arrow function 
 * syntax into ES5 function expression syntax.
 */
var _default = (0, _helperPluginUtils.declare)((api, options) => {
  // Ensure the version of Babel being used is at least 7.
  api.assertVersion(7);

  // Extract the `spec` option from the options object.
  const {
    spec
  } = options;

  // Return a plugin object with `name` and `visitor` properties.
  return {
    name: "transform-arrow-functions",
    visitor: {
      // Define a visitor for ArrowFunctionExpression nodes.
      ArrowFunctionExpression(path) {
        // If the current node is not an arrow function, terminate the process.
        if (!path.isArrowFunctionExpression()) return;

        // Convert the arrow function into a traditional function expression.
        path.arrowFunctionToExpression({
          allowInsertArrow: false, // Do not allow inserting an arrow during transformation.
          specCompliant: !!spec   // Use 'specCompliant' option if 'spec' is truthy.
        });
      }
    }
  };
});

// Set the default export to the Babel plugin.
exports.default = _default;

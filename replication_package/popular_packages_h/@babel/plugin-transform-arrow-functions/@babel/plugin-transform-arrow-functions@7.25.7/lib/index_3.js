"use strict";

// Import the necessary utility from Babel's helper plugin utils
const { declare } = require("@babel/helper-plugin-utils");

// Define and export the Babel plugin
module.exports = declare((api, options) => {
  // Ensure this plugin runs with Babel version 7 or above
  api.assertVersion(7);

  // Determine configuration for arrow function transformation
  const noNewArrows = api.assumption("noNewArrows") ?? !options.spec;

  return {
    // Plugin name
    name: "transform-arrow-functions",

    // Visitor definitions for Babel's AST traversal
    visitor: {
      // Target arrow function expressions
      ArrowFunctionExpression(path) {
        // Ensure the path is actually an ArrowFunctionExpression
        if (!path.isArrowFunctionExpression()) return;

        // Transform the arrow function to a normal function expression
        path.arrowFunctionToExpression({
          allowInsertArrow: false,
          noNewArrows,
          specCompliant: !noNewArrows
        });
      }
    }
  };
});

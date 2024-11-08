"use strict";

// Importing the `declare` function from the '@babel/helper-plugin-utils' module
const { declare } = require("@babel/helper-plugin-utils");

// Defining the default export using the `declare` function
const transformArrowFunctionsPlugin = declare((api, options) => {
  // Ensures compatibility with Babel version 7
  api.assertVersion(7);

  // Destructuring the spec option from the options argument
  const { spec } = options;

  // Returning the plugin configuration object
  return {
    name: "transform-arrow-functions", // A name for the Babel plugin
    visitor: {
      // Visitor method for ArrowFunctionExpression nodes
      ArrowFunctionExpression(path) {
        // Ensures the path is an ArrowFunctionExpression
        if (!path.isArrowFunctionExpression()) return;

        // Transforms the arrow function to a regular function expression
        path.arrowFunctionToExpression({
          allowInsertArrow: false,
          specCompliant: !!spec // Converts spec to a boolean
        });
      }
    }
  };
});

// Exporting the transformArrowFunctionsPlugin as the default export
module.exports.default = transformArrowFunctionsPlugin;

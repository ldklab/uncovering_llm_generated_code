"use strict";

// Import necessary utilities and transforms
const { declare } = require("@babel/helper-plugin-utils");
const regeneratorTransform = require("regenerator-transform");

// Export the default function
const transformRegeneratorPlugin = declare(({ types: t, assertVersion }) => {
  // Check if Babel version is 7
  assertVersion(7);

  // Return plugin configuration object
  return {
    name: "transform-regenerator",
    inherits: regeneratorTransform.default,
    visitor: {
      CallExpression(path) {
        // Ensure the regeneratorRuntime helper is available
        if (!(this.availableHelper && this.availableHelper.call(this, "regeneratorRuntime"))) {
          return;
        }

        // Get the callee of the CallExpression
        const callee = path.get("callee");

        // Check if it is a member expression
        if (!callee.isMemberExpression()) return;

        // Get the object of the member expression
        const obj = callee.get("object");

        // If the object is the "regeneratorRuntime" identifier
        if (obj.isIdentifier({ name: "regeneratorRuntime" })) {
          // Add the regeneratorRuntime helper
          const helper = this.addHelper("regeneratorRuntime");

          // If the helper is an arrow function, replace with its body
          if (t.isArrowFunctionExpression(helper)) {
            obj.replaceWith(helper.body);
            return;
          }

          // Otherwise, replace with a call expression
          obj.replaceWith(t.callExpression(helper, []));
        }
      }
    }
  };
});

module.exports = transformRegeneratorPlugin;

//# sourceMappingURL=index.js.map

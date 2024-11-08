"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _regeneratorTransform = require("regenerator-transform");

// Declare the export as a Babel plugin using the helper-plugin-utils
var _default = exports.default = (0, _helperPluginUtils.declare)(({
  types: t,
  assertVersion
}) => {
  // Assert that the Babel version is 7 or higher
  assertVersion(7);

  // Return the plugin object configuration
  return {
    // Name of the plugin
    name: "transform-regenerator",
    // Inherit functionality from regenerator-transform
    inherits: _regeneratorTransform.default,

    // Visitor methods for traversing the AST (Abstract Syntax Tree)
    visitor: {
      CallExpression(path) {
        // @babel/helper-plugin-utils context property 'availableHelper' allows checking if a helper is available
        // in this case "regeneratorRuntime"
        var _this$availableHelper;
        if (!((_this$availableHelper = this.availableHelper) != null && _this$availableHelper.call(this, "regeneratorRuntime"))) {
          return;
        }

        // Check if the callee is a MemberExpression
        const callee = path.get("callee");
        if (!callee.isMemberExpression()) return;

        const obj = callee.get("object");
        // Check if the object of callee is 'regeneratorRuntime'
        if (obj.isIdentifier({ name: "regeneratorRuntime" })) {
          // Add 'regeneratorRuntime' helper if needed
          const helper = this.addHelper("regeneratorRuntime");

          // If the helper is an ArrowFunctionExpression, replace the object with the body of the helper
          if (t.isArrowFunctionExpression(helper)) {
            obj.replaceWith(helper.body);
            return;
          }

          // Replace the object with a CallExpression of the helper
          obj.replaceWith(t.callExpression(helper, []));
        }
      }
    }
  };
});

//# sourceMappingURL=index.js.map

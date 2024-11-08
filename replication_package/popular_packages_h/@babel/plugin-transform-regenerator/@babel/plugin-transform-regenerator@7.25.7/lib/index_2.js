"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _helperPluginUtils = require("@babel/helper-plugin-utils");
var _regeneratorTransform = require("regenerator-transform");

var _default = exports.default = (0, _helperPluginUtils.declare)(({ types: t, assertVersion }) => {
  assertVersion(7);
  
  return {
    name: "transform-regenerator",
    inherits: _regeneratorTransform.default,
    visitor: {
      CallExpression(path) {
        if (!this.availableHelper || !this.availableHelper("regeneratorRuntime")) {
          return;
        }
        
        const callee = path.get("callee");
        if (!callee.isMemberExpression()) return;
        
        const obj = callee.get("object");
        if (obj.isIdentifier({ name: "regeneratorRuntime" })) {
          const helper = this.addHelper("regeneratorRuntime");
          
          if (t.isArrowFunctionExpression(helper)) {
            obj.replaceWith(helper.body);
          } else {
            obj.replaceWith(t.callExpression(helper, []));
          }
        }
      }
    }
  };
});

//# sourceMappingURL=index.js.map

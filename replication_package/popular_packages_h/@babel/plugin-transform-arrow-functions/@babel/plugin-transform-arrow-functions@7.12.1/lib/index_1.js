"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

const transformArrowFunctionsPlugin = declare((api, options) => {
  api.assertVersion(7);
  
  const { spec } = options;

  return {
    name: "transform-arrow-functions",
    
    visitor: {
      ArrowFunctionExpression(path) {
        if (!path.isArrowFunctionExpression()) return;

        path.arrowFunctionToExpression({
          allowInsertArrow: false,
          specCompliant: !!spec
        });
      }
    }
  };
});

exports.default = transformArrowFunctionsPlugin;

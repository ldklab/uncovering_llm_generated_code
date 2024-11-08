"use strict";

const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare((api, options) => {
  api.assertVersion(7);

  const noNewArrows = api.assumption("noNewArrows") !== undefined ? api.assumption("noNewArrows") : !options.spec;

  return {
    name: "transform-arrow-functions",
    visitor: {
      ArrowFunctionExpression(path) {
        if (!path.isArrowFunctionExpression()) return;

        path.arrowFunctionToExpression({
          allowInsertArrow: false,
          noNewArrows,
          specCompliant: !noNewArrows
        });
      }
    }
  };
});

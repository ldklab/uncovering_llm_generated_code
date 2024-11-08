"use strict";

import { declare } from "@babel/helper-plugin-utils";

export default declare((api, options) => {
  api.assertVersion(7);

  const noNewArrows = api.assumption("noNewArrows") ?? !options.spec;

  return {
    name: "transform-arrow-functions",
    visitor: {
      ArrowFunctionExpression(path) {
        if (!path.isArrowFunctionExpression()) return;

        path.arrowFunctionToExpression({
          allowInsertArrow: false,
          noNewArrows,
          specCompliant: !noNewArrows,
        });
      }
    }
  };
});

//# sourceMappingURL=index.js.map

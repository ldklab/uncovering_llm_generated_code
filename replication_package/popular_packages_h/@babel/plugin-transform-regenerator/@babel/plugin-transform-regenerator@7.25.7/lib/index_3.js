"use strict";

import { declare } from "@babel/helper-plugin-utils";
import regeneratorTransform from "regenerator-transform";

export default declare(({ types: t, assertVersion }) => {
  assertVersion(7);

  return {
    name: "transform-regenerator",
    inherits: regeneratorTransform,
    visitor: {
      CallExpression(path) {
        if (this.availableHelper?.("regeneratorRuntime")) {
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
    }
  };
});

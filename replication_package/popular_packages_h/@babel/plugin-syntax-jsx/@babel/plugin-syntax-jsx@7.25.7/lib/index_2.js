"use strict";

import { declare } from "@babel/helper-plugin-utils";

export default declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-jsx",
    manipulateOptions(opts, parserOpts) {
      if (!parserOpts.plugins.some(plugin => {
        return Array.isArray(plugin) ? plugin[0] === "typescript" : plugin === "typescript";
      })) {
        parserOpts.plugins.push("jsx");
      }
    }
  };
});

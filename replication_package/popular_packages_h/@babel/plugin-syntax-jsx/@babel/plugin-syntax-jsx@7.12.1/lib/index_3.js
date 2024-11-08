"use strict";

import { declare } from "@babel/helper-plugin-utils";

const syntaxJsxPlugin = declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-jsx",

    manipulateOptions(opts, parserOpts) {
      const hasTypeScript = parserOpts.plugins.some(plugin => {
        return Array.isArray(plugin) ? plugin[0] === "typescript" : plugin === "typescript";
      });

      if (!hasTypeScript) {
        parserOpts.plugins.push("jsx");
      }
    }
  };
});

export default syntaxJsxPlugin;

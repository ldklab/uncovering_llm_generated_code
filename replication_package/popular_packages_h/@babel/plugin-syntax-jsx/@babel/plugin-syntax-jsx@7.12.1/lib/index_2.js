"use strict";

const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-jsx",

    manipulateOptions(opts, parserOpts) {
      const hasTypeScript = parserOpts.plugins.some(plugin => 
        Array.isArray(plugin) ? plugin[0] === "typescript" : plugin === "typescript"
      );

      if (!hasTypeScript) {
        parserOpts.plugins.push("jsx");
      }
    }
  };
});

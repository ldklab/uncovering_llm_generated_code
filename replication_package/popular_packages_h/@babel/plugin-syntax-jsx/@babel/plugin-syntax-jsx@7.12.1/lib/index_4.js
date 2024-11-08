"use strict";

const { declare } = require("@babel/helper-plugin-utils");

const myJsxSyntaxPlugin = declare(api => {
  api.assertVersion(7);
  
  return {
    name: "syntax-jsx",

    manipulateOptions(opts, parserOpts) {
      // Check if TypeScript is already a parser plugin
      const hasTypeScript = parserOpts.plugins.some(plugin => 
        (Array.isArray(plugin) ? plugin[0] : plugin) === "typescript"
      );

      if (!hasTypeScript) {
        // Add JSX plugin if TypeScript is not present
        parserOpts.plugins.push("jsx");
      }
    }
  };
});

module.exports = myJsxSyntaxPlugin;

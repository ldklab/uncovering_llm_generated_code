"use strict";

const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-jsx",

    manipulateOptions(opts, parserOpts) {
      const hasTypeScriptPlugin = parserOpts.plugins.some(p => (Array.isArray(p) ? p[0] : p) === "typescript");
      
      if (!hasTypeScriptPlugin) {
        parserOpts.plugins.push("jsx");
      }
    }
  };
});

//# sourceMappingURL=index.js.map

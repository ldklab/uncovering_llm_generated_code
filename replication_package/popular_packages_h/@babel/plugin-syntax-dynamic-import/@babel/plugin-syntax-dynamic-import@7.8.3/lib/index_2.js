"use strict";

const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare(api => {
  api.assertVersion(7);
  
  return {
    name: "syntax-dynamic-import",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("dynamicImport");
    }
  };
});

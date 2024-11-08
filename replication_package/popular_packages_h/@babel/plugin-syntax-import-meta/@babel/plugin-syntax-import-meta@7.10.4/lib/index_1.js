"use strict";

const { declare } = require("@babel/helper-plugin-utils");

module.exports = declare(api => {
  api.assertVersion(7);
  return {
    name: "syntax-import-meta",

    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("importMeta");
    }

  };
});

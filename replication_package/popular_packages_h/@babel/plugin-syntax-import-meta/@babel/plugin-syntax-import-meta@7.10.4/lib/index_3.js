"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

const myPlugin = declare(api => {
  api.assertVersion(7);
  return {
    name: "syntax-import-meta",
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("importMeta");
    }
  };
});

exports.default = myPlugin;

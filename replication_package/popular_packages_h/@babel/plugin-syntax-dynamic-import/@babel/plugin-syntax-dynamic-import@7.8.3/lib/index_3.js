"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

const dynamicImportSyntaxPlugin = declare(api => {
  api.assertVersion(7);
  return {
    name: "syntax-dynamic-import",
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("dynamicImport");
    }
  };
});

exports.default = dynamicImportSyntaxPlugin;

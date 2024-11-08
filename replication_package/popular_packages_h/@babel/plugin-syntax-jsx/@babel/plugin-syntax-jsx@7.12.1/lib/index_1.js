"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

const _default = declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-jsx",

    manipulateOptions(opts, parserOpts) {
      if (parserOpts.plugins.some(plugin => (Array.isArray(plugin) ? plugin[0] : plugin) === "typescript")) {
        return;
      }

      parserOpts.plugins.push("jsx");
    }
  };
});

exports.default = _default;

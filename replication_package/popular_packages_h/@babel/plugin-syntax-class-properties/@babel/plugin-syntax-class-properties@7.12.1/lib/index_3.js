"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

const myPlugin = declare(api => {
  api.assertVersion(7);
  return {
    name: "syntax-class-properties",
    manipulateOptions(opts, parserOptions) {
      parserOptions.plugins.push("classProperties", "classPrivateProperties", "classPrivateMethods");
    }
  };
});

exports.default = myPlugin;

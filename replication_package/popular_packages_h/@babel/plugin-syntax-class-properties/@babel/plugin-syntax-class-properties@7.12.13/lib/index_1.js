"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

const plugin = declare(api => {
  // Ensure that the version of Babel used is 7 or above
  api.assertVersion(7);

  return {
    name: "syntax-class-properties",

    // This function modifies the parser options to include plugins
    // that enable the parsing of class properties and methods.
    manipulateOptions(opts, parserOpts) {
      parserOpts.plugins.push("classProperties", "classPrivateProperties", "classPrivateMethods");
    }
  };
});

exports.default = plugin;

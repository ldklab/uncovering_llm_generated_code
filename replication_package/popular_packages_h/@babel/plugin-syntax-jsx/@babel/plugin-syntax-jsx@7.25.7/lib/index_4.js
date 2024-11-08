"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const { declare } = require("@babel/helper-plugin-utils");

exports.default = declare(api => {
  api.assertVersion(7);

  return {
    name: "syntax-jsx",
    manipulateOptions(opts, parserOpts) {
      if (!parserOpts.plugins.some(plugin => (Array.isArray(plugin) ? plugin[0] : plugin) === "typescript")) {
        parserOpts.plugins.push("jsx");
      }
    }
  };
});

//# sourceMappingURL=index.js.map

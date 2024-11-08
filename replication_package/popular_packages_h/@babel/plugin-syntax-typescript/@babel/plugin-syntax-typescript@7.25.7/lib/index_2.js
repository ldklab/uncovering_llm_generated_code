"use strict";

import { declare } from "@babel/helper-plugin-utils";

function removePlugin(plugins, name) {
  const indices = [];
  plugins.forEach((plugin, i) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    if (pluginName === name) {
      indices.unshift(i);
    }
  });
  for (const i of indices) {
    plugins.splice(i, 1);
  }
}

const syntaxTypescriptPlugin = declare((api, opts) => {
  api.assertVersion(7);
  const { disallowAmbiguousJSXLike, dts, isTSX } = opts;

  return {
    name: "syntax-typescript",
    manipulateOptions(_, parserOpts) {
      const { plugins } = parserOpts;
      removePlugin(plugins, "flow");
      removePlugin(plugins, "jsx");
      plugins.push("objectRestSpread", "classProperties");
      if (isTSX) {
        plugins.push("jsx");
      }
      parserOpts.plugins.push(["typescript", { disallowAmbiguousJSXLike, dts }]);
    },
  };
});

export default syntaxTypescriptPlugin;

//# sourceMappingURL=index.js.map

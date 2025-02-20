"use strict";

const { declare } = require("@babel/helper-plugin-utils");

function removePlugin(plugins, name) {
  const indices = [];
  plugins.forEach((plugin, i) => {
    const pluginName = Array.isArray(plugin) ? plugin[0] : plugin;
    if (pluginName === name) {
      indices.unshift(i);
    }
  });
  indices.forEach(i => {
    plugins.splice(i, 1);
  });
}

const syntaxTypescriptPlugin = declare((api, { isTSX }) => {
  api.assertVersion(7);

  return {
    name: "syntax-typescript",
    manipulateOptions(opts, parserOpts) {
      const plugins = parserOpts.plugins;
      removePlugin(plugins, "flow");
      removePlugin(plugins, "jsx");
      parserOpts.plugins.push("typescript", "classProperties", "objectRestSpread");

      if (isTSX) {
        parserOpts.plugins.push("jsx");
      }
    }
  };
});

exports.default = syntaxTypescriptPlugin;

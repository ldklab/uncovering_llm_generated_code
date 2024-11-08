"use strict";

const { getVisitor } = require("./visit");

function regeneratorTransformPlugin(context) {
  const plugin = {
    visitor: getVisitor(context)
  };

  if (context && parseInt(context.version, 10) >= 7) {
    plugin.name = "regenerator-transform";
  }
  return plugin;
}

exports.__esModule = true;
exports.default = regeneratorTransformPlugin;

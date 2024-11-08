"use strict";

exports.__esModule = true;
exports["default"] = createPlugin;

const { getVisitor } = require("./visit");

function createPlugin(context) {
  const plugin = {
    visitor: getVisitor(context)
  };

  const version = context?.version;

  if (version && parseInt(version, 10) >= 7) {
    plugin.name = "regenerator-transform";
  }
  
  return plugin;
}

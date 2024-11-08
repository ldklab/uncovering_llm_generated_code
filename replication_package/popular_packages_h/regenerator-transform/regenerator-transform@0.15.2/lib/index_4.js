"use strict";

const visit = require("./visit");

function createPlugin(context) {
  const plugin = {
    visitor: visit.getVisitor(context)
  };

  const version = context ? context.version : null;
  
  if (version && parseInt(version, 10) >= 7) {
    plugin.name = "regenerator-transform";
  }

  return plugin;
}

exports.__esModule = true;
exports.default = createPlugin;

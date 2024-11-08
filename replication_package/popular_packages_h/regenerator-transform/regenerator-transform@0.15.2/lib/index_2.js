"use strict";

const visit = require("./visit");

function createPlugin(context) {
  const plugin = {
    visitor: visit.getVisitor(context)
  };

  const version = context?.version;

  if (version && parseInt(version, 10) >= 7) {
    plugin.name = "regenerator-transform";
  }

  return plugin;
}

exports.default = createPlugin;

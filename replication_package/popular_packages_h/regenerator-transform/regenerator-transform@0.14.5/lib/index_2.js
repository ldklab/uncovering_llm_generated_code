"use strict";

exports.__esModule = true;
exports["default"] = createPlugin;

const { getVisitor } = require("./visit");

/**
 * Creates a Babel plugin configuration object.
 * 
 * @param {Object} context - The context object that may contain version info.
 * @returns {Object} A plugin configuration object with a visitor.
 */
function createPlugin(context) {
  const plugin = {
    visitor: getVisitor(context),
  };

  // Check for the Babel version and add a "name" property if version is 7 or higher.
  const version = context?.version;
  if (version && parseInt(version, 10) >= 7) {
    plugin.name = "regenerator-transform";
  }

  return plugin;
}

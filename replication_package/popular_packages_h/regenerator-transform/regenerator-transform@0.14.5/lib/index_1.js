"use strict";

exports.__esModule = true;
exports["default"] = regeneratorPlugin;

var visit = require("./visit");

/**
 * This module exports a function that creates a Babel plugin.
 * The plugin is built using a visitor function fetched from the 'visit' module,
 * specifically tailored to the given context.
 * The plugin's name is set to "regenerator-transform" if the context has a version
 * property indicating Babel version 7 or higher, as earlier versions of Babel (6.x) 
 * do not accept a name property which would cause errors.
 * The functionality is to support Regenerator transformations in Babel.
 */
function regeneratorPlugin(context) {
  var plugin = {
    visitor: visit.getVisitor(context)
  };

  // Verify the context and check its version
  var version = context && context.version;

  // Only apply the name property for Babel version 7 or later
  if (version && parseInt(version, 10) >= 7) {
    plugin.name = "regenerator-transform";
  }

  return plugin;
}

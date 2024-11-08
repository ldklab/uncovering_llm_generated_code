"use strict";

exports.__esModule = true;
exports["default"] = defaultFunction;

var _visit = require("./visit");

/**
 * This module exports a function that configures a plugin with a visitor
 * obtained from an imported 'visit' module. The function ensures compatibility
 * with different versions by checking a context object, particularly its version,
 * to conditionally assign a name to the plugin object.
 */

function defaultFunction(context) {
  // Create a plugin object with a visitor property derived from the context.
  var plugin = {
    visitor: (0, _visit.getVisitor)(context)
  };

  // Extract the version from the context object if it exists.
  var version = context && context.version;

  // If the version is 7 or above, set the plugin's name for compatibility
  // with Babel versions newer than 6.x.
  if (version && parseInt(version, 10) >= 7) {
    plugin.name = "regenerator-transform";
  }

  // Return the configured plugin.
  return plugin;
}

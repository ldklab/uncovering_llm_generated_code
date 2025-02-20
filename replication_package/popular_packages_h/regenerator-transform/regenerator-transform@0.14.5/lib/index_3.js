"use strict";

exports.__esModule = true;
exports["default"] = defaultFunctionality;

var { getVisitor } = require("./visit");

function defaultFunctionality(context) {
  var plugin = {
    visitor: getVisitor(context)
  };

  var version = context && context.version;

  if (version && parseInt(version, 10) >= 7) {
    plugin.name = "regenerator-transform";
  }

  return plugin;
}

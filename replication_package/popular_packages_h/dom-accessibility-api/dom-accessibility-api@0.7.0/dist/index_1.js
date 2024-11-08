"use strict";

exports.__esModule = true;

var _exportNames = {
  computeAccessibleDescription: true,
  computeAccessibleName: true,
  getRole: true,
  isDisabled: true
};

exports.computeAccessibleDescription = require("./accessible-description").computeAccessibleDescription;
exports.computeAccessibleName = require("./accessible-name").computeAccessibleName;
exports.getRole = require("./getRole").default;
exports.isDisabled = require("./is-disabled").isDisabled;

var _isInaccessible = require("./is-inaccessible");

Object.keys(_isInaccessible).forEach(function(key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _isInaccessible[key]) return;
  exports[key] = _isInaccessible[key];
});

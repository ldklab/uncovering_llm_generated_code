"use strict";

exports.__esModule = true;

// Exported function names
var _exportNames = {
  computeAccessibleDescription: true,
  computeAccessibleName: true,
  getRole: true,
  isDisabled: true
};

// Re-export functions after importing
exports.computeAccessibleDescription = require("./accessible-description").computeAccessibleDescription;
exports.computeAccessibleName = require("./accessible-name").computeAccessibleName;
exports.getRole = require("./getRole").default;
exports.isDisabled = require("./is-disabled").isDisabled;

// Import all from is-inaccessible and re-export conditionally
var _isInaccessible = require("./is-inaccessible");
Object.keys(_isInaccessible).forEach(function (key) {
  if (key === "default" || key === "__esModule" || _exportNames[key] || (exports[key] === _isInaccessible[key])) return;
  exports[key] = _isInaccessible[key];
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
//# sourceMappingURL=index.js.map

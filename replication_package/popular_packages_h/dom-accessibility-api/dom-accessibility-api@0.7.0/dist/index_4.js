"use strict";

// Define which names are being explicitly exported
exports.__esModule = true;
const _exportNames = {
  computeAccessibleDescription: true,
  computeAccessibleName: true,
  getRole: true,
  isDisabled: true
};

// Import and re-export computeAccessibleDescription
var _accessibleDescription = require("./accessible-description");
exports.computeAccessibleDescription = _accessibleDescription.computeAccessibleDescription;

// Import and re-export computeAccessibleName
var _accessibleName = require("./accessible-name");
exports.computeAccessibleName = _accessibleName.computeAccessibleName;

// Import and re-export getRole as a default
var _getRole = _interopRequireDefault(require("./getRole"));
exports.getRole = _getRole.default;

// Import all exports from is-inaccessible and re-export if not already exported
var _isInaccessible = require("./is-inaccessible");
Object.keys(_isInaccessible).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _isInaccessible[key]) return;
  exports[key] = _isInaccessible[key];
});

// Import and re-export isDisabled
var _isDisabled = require("./is-disabled");
exports.isDisabled = _isDisabled.isDisabled;

// Helper function to handle default imports
function _interopRequireDefault(obj) { 
  return obj && obj.__esModule ? obj : { default: obj }; 
}

//# sourceMappingURL=index.js.map

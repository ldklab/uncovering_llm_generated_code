"use strict";

exports.__esModule = true;

var _exportNames = {
  computeAccessibleDescription: true,
  computeAccessibleName: true,
  getRole: true,
  isDisabled: true
};

exports.computeAccessibleDescription = void 0;
exports.computeAccessibleName = void 0;
exports.getRole = void 0;
exports.isDisabled = void 0;

// Import modules and re-export selected functions
var _accessibleDescription = require("./accessible-description");
exports.computeAccessibleDescription = _accessibleDescription.computeAccessibleDescription;

var _accessibleName = require("./accessible-name");
exports.computeAccessibleName = _accessibleName.computeAccessibleName;

var _getRole = _interopRequireDefault(require("./getRole"));
exports.getRole = _getRole.default;

var _isDisabled = require("./is-disabled");
exports.isDisabled = _isDisabled.isDisabled;

// Import the whole module and export selective keys
var _isInaccessible = require("./is-inaccessible");
Object.keys(_isInaccessible).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (_exportNames.hasOwnProperty(key)) return;
  if (exports[key] === _isInaccessible[key]) return;
  exports[key] = _isInaccessible[key];
});

// Helper function to handle default imports
function _interopRequireDefault(obj) { 
  return obj && obj.__esModule ? obj : { default: obj }; 
}
//# sourceMappingURL=index.js.map

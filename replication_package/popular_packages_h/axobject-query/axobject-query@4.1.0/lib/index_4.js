"use strict";

// Set up export definitions for the module
Object.defineProperty(exports, "__esModule", {
  value: true
});

// Initialize exportable variables
exports.elementAXObjects = exports.AXObjects = exports.AXObjectRoles = exports.AXObjectElements = void 0;

// Import data from the defined module files
var AXObjectElementMap = _interopRequireDefault(require("./AXObjectElementMap"));
var AXObjectRoleMap = _interopRequireDefault(require("./AXObjectRoleMap"));
var AXObjectsMap = _interopRequireDefault(require("./AXObjectsMap"));
var elementAXObjectMap = _interopRequireDefault(require("./elementAXObjectMap"));

// Handle default imports correctly
function _interopRequireDefault(obj) { 
  return obj && obj.__esModule ? obj : { default: obj }; 
}

// Assign imported modules to the exportable variables
var AXObjectElements = AXObjectElementMap.default;
exports.AXObjectElements = AXObjectElements;

var AXObjectRoles = AXObjectRoleMap.default;
exports.AXObjectRoles = AXObjectRoles;

var AXObjects = AXObjectsMap.default;
exports.AXObjects = AXObjects;

var elementAXObjects = elementAXObjectMap.default;
exports.elementAXObjects = elementAXObjects;

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.elementAXObjects = exports.AXObjects = exports.AXObjectRoles = exports.AXObjectElements = void 0;

// Import default modules
var AXObjectElementMap = require("./AXObjectElementMap").default;
var AXObjectRoleMap = require("./AXObjectRoleMap").default;
var AXObjectsMap = require("./AXObjectsMap").default;
var elementAXObjectMap = require("./elementAXObjectMap").default;

// Assign imported modules to variables
var AXObjectElements = AXObjectElementMap;
exports.AXObjectElements = AXObjectElements;

var AXObjectRoles = AXObjectRoleMap;
exports.AXObjectRoles = AXObjectRoles;

var AXObjects = AXObjectsMap;
exports.AXObjects = AXObjects;

var elementAXObjects = elementAXObjectMap;
exports.elementAXObjects = elementAXObjects;

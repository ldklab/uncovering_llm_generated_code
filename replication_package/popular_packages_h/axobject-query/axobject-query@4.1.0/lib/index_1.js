"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// Import default exports from various mapped files
var AXObjectElementMap = require("./AXObjectElementMap").default;
var AXObjectRoleMap = require("./AXObjectRoleMap").default;
var AXObjectsMap = require("./AXObjectsMap").default;
var elementAXObjectMap = require("./elementAXObjectMap").default;

// Assign the imported modules to corresponding variables
var AXObjectElements = AXObjectElementMap;
exports.AXObjectElements = AXObjectElements;

var AXObjectRoles = AXObjectRoleMap;
exports.AXObjectRoles = AXObjectRoles;

var AXObjects = AXObjectsMap;
exports.AXObjects = AXObjects;

var elementAXObjects = elementAXObjectMap;
exports.elementAXObjects = elementAXObjects;

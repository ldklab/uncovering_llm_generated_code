"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

// Importing default exports from several modules and assigning them to variables
var ariaPropsMap = require("./ariaPropsMap").default;
var domMap = require("./domMap").default;
var rolesMap = require("./rolesMap").default;
var elementRoleMap = require("./elementRoleMap").default;
var roleElementMap = require("./roleElementMap").default;

// Re-exporting the imported maps with specific exports
exports.aria = ariaPropsMap;
exports.dom = domMap;
exports.roles = rolesMap;
exports.elementRoles = elementRoleMap;
exports.roleElements = roleElementMap;

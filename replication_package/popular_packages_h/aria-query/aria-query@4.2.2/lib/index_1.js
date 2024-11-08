"use strict";

// Import necessary modules
const ariaPropsMap = require("./ariaPropsMap");
const domMap = require("./domMap");
const rolesMap = require("./rolesMap");
const elementRoleMap = require("./elementRoleMap");
const roleElementMap = require("./roleElementMap");

// Export the mappings for ARIA properties, DOM mappings, roles, and roles-elements relationships
exports.aria = ariaPropsMap.default;
exports.dom = domMap.default;
exports.roles = rolesMap.default;
exports.elementRoles = elementRoleMap.default;
exports.roleElements = roleElementMap.default;

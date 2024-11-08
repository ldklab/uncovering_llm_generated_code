"use strict";

// Importing modules using a function that ensures the default export is properly captured.
function _interopRequireDefault(e) { 
  return e && e.__esModule ? e : { default: e }; 
}

// Importing various maps related to ARIA, DOM, and roles.
const _ariaPropsMap = _interopRequireDefault(require("./ariaPropsMap"));
const _domMap = _interopRequireDefault(require("./domMap"));
const _rolesMap = _interopRequireDefault(require("./rolesMap"));
const _elementRoleMap = _interopRequireDefault(require("./elementRoleMap"));
const _roleElementMap = _interopRequireDefault(require("./roleElementMap"));

// Exporting the default exports of each imported module as named exports.
exports.aria = _ariaPropsMap.default;
exports.dom = _domMap.default;
exports.roles = _rolesMap.default;
exports.elementRoles = _elementRoleMap.default;
exports.roleElements = _roleElementMap.default;

Object.defineProperty(exports, "__esModule", {
  value: true
});

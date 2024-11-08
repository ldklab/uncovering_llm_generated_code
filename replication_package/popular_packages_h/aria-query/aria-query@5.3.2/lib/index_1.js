"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.aria = void 0;
exports.dom = void 0;
exports.roles = void 0;
exports.elementRoles = void 0;
exports.roleElements = void 0;

var _ariaPropsMap = _interopRequireDefault(require("./ariaPropsMap"));
var _domMap = _interopRequireDefault(require("./domMap"));
var _rolesMap = _interopRequireDefault(require("./rolesMap"));
var _elementRoleMap = _interopRequireDefault(require("./elementRoleMap"));
var _roleElementMap = _interopRequireDefault(require("./roleElementMap"));

function _interopRequireDefault(module) { 
  return module && module.__esModule ? module : { default: module }; 
}

var aria = _ariaPropsMap.default;
var dom = _domMap.default;
var roles = _rolesMap.default;
var elementRoles = _elementRoleMap.default;
var roleElements = _roleElementMap.default;

exports.aria = aria;
exports.dom = dom;
exports.roles = roles;
exports.elementRoles = elementRoles;
exports.roleElements = roleElements;

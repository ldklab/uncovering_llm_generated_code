"use strict";

exports.__esModule = true;

const { computeAccessibleDescription } = require("./accessible-description");
exports.computeAccessibleDescription = computeAccessibleDescription;

const { computeAccessibleName } = require("./accessible-name");
exports.computeAccessibleName = computeAccessibleName;

const _getRole = require("./getRole");
const getRole = _getRole && _getRole.__esModule ? _getRole.default : _getRole;
exports.getRole = getRole;

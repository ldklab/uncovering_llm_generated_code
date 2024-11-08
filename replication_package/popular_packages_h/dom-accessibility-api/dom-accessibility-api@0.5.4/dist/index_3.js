"use strict";

exports.__esModule = true;
exports.getRole = exports.computeAccessibleName = exports.computeAccessibleDescription = void 0;

var { computeAccessibleDescription } = require("./accessible-description");
exports.computeAccessibleDescription = computeAccessibleDescription;

var { computeAccessibleName } = require("./accessible-name");
exports.computeAccessibleName = computeAccessibleName;

var _getRole = require("./getRole");
var getRole = _getRole && _getRole.__esModule ? _getRole.default : _getRole;
exports.getRole = getRole;
//# sourceMappingURL=index.js.map

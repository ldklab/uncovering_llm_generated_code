"use strict";

exports.__esModule = true;
exports["default"] = void 0;

var Processor = require("./processor");
var selectors = require("./selectors");

var parser = function (processor) {
  return new Processor(processor);
};

Object.assign(parser, selectors);

delete parser.__esModule;

var _default = parser;
exports["default"] = _default;
module.exports = exports.default;

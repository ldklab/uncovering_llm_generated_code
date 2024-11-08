"use strict";

const Processor = require("./processor").default;
const selectors = require("./selectors");

const parser = function(processor) {
  return new Processor(processor);
};

Object.assign(parser, selectors);
delete parser.__esModule;

module.exports = parser;

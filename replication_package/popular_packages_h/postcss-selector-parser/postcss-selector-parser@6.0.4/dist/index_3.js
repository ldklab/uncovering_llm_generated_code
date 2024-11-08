"use strict";

const Processor = require("./processor").default;
const selectors = require("./selectors");

function parser(processor) {
  return new Processor(processor);
}

Object.assign(parser, selectors);

module.exports = parser;

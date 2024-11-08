"use strict";

const Processor = require("./processor").default;
const selectors = require("./selectors");

function parser(processor) {
  return new Processor(processor);
}

// Copy properties from selectors to parser
Object.assign(parser, selectors);

module.exports = parser;

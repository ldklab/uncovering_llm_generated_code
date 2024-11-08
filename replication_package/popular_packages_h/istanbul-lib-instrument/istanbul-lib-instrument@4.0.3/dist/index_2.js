"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const { defaults: { instrumenter: defaultOpts } } = require("@istanbuljs/schema");
const Instrumenter = require("./instrumenter").default;
const programVisitor = require("./visitor").default;
const readInitialCoverage = require("./read-coverage").default;

/**
 * createInstrumenter creates a new instrumenter with the
 * supplied options.
 * @param {Object} opts - instrumenter options. See the documentation
 * for the Instrumenter class.
 */
function createInstrumenter(opts) {
  return new Instrumenter(opts);
}

exports.createInstrumenter = createInstrumenter;
exports.programVisitor = programVisitor;
exports.readInitialCoverage = readInitialCoverage;
exports.defaultOpts = defaultOpts;

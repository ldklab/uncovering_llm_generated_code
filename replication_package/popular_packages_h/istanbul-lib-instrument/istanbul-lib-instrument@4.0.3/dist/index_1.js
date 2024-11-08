"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createInstrumenter = createInstrumenter;
exports.defaultOpts = void 0;

const { defaults } = require("@istanbuljs/schema");
const Instrumenter = require("./instrumenter").default;
const programVisitor = require("./visitor").default;
const readInitialCoverage = require("./read-coverage").default;

exports.programVisitor = programVisitor;
exports.readInitialCoverage = readInitialCoverage;

/**
 * createInstrumenter creates a new instrumenter with the
 * supplied options.
 * @param {Object} opts - instrumenter options.
 */
function createInstrumenter(opts) {
  return new Instrumenter(opts);
}

const defaultOpts = defaults.instrumenter;
exports.defaultOpts = defaultOpts;

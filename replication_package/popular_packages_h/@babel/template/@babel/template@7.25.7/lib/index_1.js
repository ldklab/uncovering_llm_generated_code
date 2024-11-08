"use strict";

// Import required modules
const formatters = require("./formatters.js");
const _builder = require("./builder.js");

// Create various builder functions using the formatter methods
const smart = (0, _builder.default)(formatters.smart);
const statement = (0, _builder.default)(formatters.statement);
const statements = (0, _builder.default)(formatters.statements);
const expression = (0, _builder.default)(formatters.expression);
const program = (0, _builder.default)(formatters.program);

// Export these functions and configure the default export
exports.smart = smart;
exports.statement = statement;
exports.statements = statements;
exports.expression = expression;
exports.program = program;

// Assign the smart function as the default export,
// extending it with additional builder functions and properties
exports.default = Object.assign(smart.bind(undefined), {
  smart,
  statement,
  statements,
  expression,
  program,
  ast: smart.ast
});


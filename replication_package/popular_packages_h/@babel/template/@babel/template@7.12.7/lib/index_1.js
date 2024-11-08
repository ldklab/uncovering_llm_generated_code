"use strict";

// This code defines and exports several functions using a builder pattern and formatters.
// It utilizes a module system with support for CommonJS style imports and ES6 exports.

const formatters = require("./formatters");
const builder = require("./builder").default;

// Define 'smart', 'statement', 'statements', 'expression', 'program' using a builder pattern
const smart = builder(formatters.smart);
const statement = builder(formatters.statement);
const statements = builder(formatters.statements);
const expression = builder(formatters.expression);
const program = builder(formatters.program);

// Export all the functions and default module binding to 'smart' with additional attributes
module.exports = {
  smart,
  statement,
  statements,
  expression,
  program,
  default: Object.assign(smart.bind(undefined), {
    smart,
    statement,
    statements,
    expression,
    program,
    ast: smart.ast
  })
};

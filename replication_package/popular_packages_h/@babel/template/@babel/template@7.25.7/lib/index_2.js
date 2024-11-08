"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const formatters = require("./formatters.js");
const buildUsingDefault = require("./builder.js").default;

const smart = buildUsingDefault(formatters.smart);
const statement = buildUsingDefault(formatters.statement);
const statements = buildUsingDefault(formatters.statements);
const expression = buildUsingDefault(formatters.expression);
const program = buildUsingDefault(formatters.program);

exports.smart = smart;
exports.statement = statement;
exports.statements = statements;
exports.expression = expression;
exports.program = program;

exports.default = Object.assign(smart.bind(undefined), {
  smart,
  statement,
  statements,
  expression,
  program,
  ast: smart.ast
});

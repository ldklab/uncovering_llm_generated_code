"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.statements = exports.statement = exports.smart = exports.program = exports.expression = exports.default = void 0;

const formatters = require("./formatters.js");
const builder = require("./builder.js");

const smart = builder.default(formatters.smart);
const statement = builder.default(formatters.statement);
const statements = builder.default(formatters.statements);
const expression = builder.default(formatters.expression);
const program = builder.default(formatters.program);

exports.smart = smart;
exports.statement = statement;
exports.statements = statements;
exports.expression = expression;
exports.program = program;

const defaultExport = Object.assign(smart.bind(undefined), {
  smart,
  statement,
  statements,
  expression,
  program,
  ast: smart.ast
});

exports.default = defaultExport;

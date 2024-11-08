"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

const formatters = require("./formatters");
const builder = require("./builder").default;

function interopRequireWildcard(obj) {  
  if (obj && obj.__esModule) return obj;
  const newObj = {};
  if (obj != null) {
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  return newObj;
}

const smart = builder(formatters.smart);
const statement = builder(formatters.statement);
const statements = builder(formatters.statements);
const expression = builder(formatters.expression);
const program = builder(formatters.program);

const defaultExport = Object.assign(smart.bind(undefined), {
  smart,
  statement,
  statements,
  expression,
  program,
  ast: smart.ast
});

exports.smart = smart;
exports.statement = statement;
exports.statements = statements;
exports.expression = expression;
exports.program = program;
exports.default = defaultExport;

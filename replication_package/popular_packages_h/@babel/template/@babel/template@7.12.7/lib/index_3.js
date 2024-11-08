"use strict";

import * as formatters from "./formatters";
import builder from "./builder";

const smart = builder(formatters.smart);
const statement = builder(formatters.statement);
const statements = builder(formatters.statements);
const expression = builder(formatters.expression);
const program = builder(formatters.program);

const exportsObject = {
  smart,
  statement,
  statements,
  expression,
  program,
  ast: smart.ast
};

exports.default = Object.assign(smart.bind(undefined), exportsObject);
export { smart, statement, statements, expression, program };

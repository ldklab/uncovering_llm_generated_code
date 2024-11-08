"use strict";

import formatters from "./formatters.js";
import builder from "./builder.js";

export const smart = builder(formatters.smart);
export const statement = builder(formatters.statement);
export const statements = builder(formatters.statements);
export const expression = builder(formatters.expression);
export const program = builder(formatters.program);

export default Object.assign(smart.bind(undefined), {
  smart,
  statement,
  statements,
  expression,
  program,
  ast: smart.ast
});

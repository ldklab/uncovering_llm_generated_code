"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.compile = exports.parse = void 0;

var parse_1 = require("./parse");
exports.parse = parse_1.parse;

var compile_1 = require("./compile");
exports.compile = compile_1.compile;

/**
 * Parses and compiles a formula into an optimized function.
 * Combines `parse` and `compile` to evaluate formulas.
 *
 * If the formula doesn't apply to any elements, it returns `falseFunc` 
 * from the `boolbase` library. Otherwise, it returns a function 
 * that takes an index and checks if it matches the formula.
 *
 * Note: The nth-rule counts from `1`, while the function counts from `0`.
 *
 * @param formula The formula to compile.
 * @example
 * const check = nthCheck("2n+3");
 *
 * check(0); // `false`
 * check(1); // `false`
 * check(2); // `true`
 * check(3); // `false`
 * check(4); // `true`
 * check(5); // `false`
 * check(6); // `true`
 */
function nthCheck(formula) {
    return compile_1.compile(parse_1.parse(formula));
}

exports.default = nthCheck;

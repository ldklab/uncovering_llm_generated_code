"use strict";

// Importing and re-exporting `parse` from './parse' module.
var parse_1 = require("./parse");
exports.parse = parse_1.parse;

// Importing and re-exporting `compile` from './compile' module.
var compile_1 = require("./compile");
exports.compile = compile_1.compile;

/**
 * Parses and compiles a formula to a highly optimized function.
 * This is a combination of `parse` and `compile`.
 *
 * If the formula doesn't match any elements,
 * it returns `falseFunc` from `boolbase`.
 * Otherwise, it returns a function that checks if a given index matches the formula.
 *
 * Note: The nth-rule starts counting at `1`, but the returned function starts at `0`.
 *
 * @param formula The formula as a string to compile.
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
    // Calls `parse` to parse the formula and then `compile` to convert it into a function.
    return compile_1.compile(parse_1.parse(formula));
}

// Setting the default export to `nthCheck` function.
exports.default = nthCheck;

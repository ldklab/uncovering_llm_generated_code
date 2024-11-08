"use strict";

const { parse } = require("./parse.js");
const { compile, generate } = require("./compile.js");

/**
 * Parses and compiles a formula to a highly optimized function.
 * Combination of `parse` and `compile`.
 *
 * If the formula doesn't match any elements,
 * it returns a false function from `boolbase`.
 * Otherwise, a function accepting an index is returned, which returns
 * whether or not the passed index matches the formula.
 *
 * Note: The nth-rule starts counting at 1, the returned function at 0.
 *
 * @param {string} formula - The formula to compile.
 * @example
 * const check = nthCheck("2n+3");
 * check(0); // false
 * check(1); // false
 * check(2); // true
 * check(3); // false
 * check(4); // true
 * check(5); // false
 * check(6); // true
 */
function nthCheck(formula) {
    return compile(parse(formula));
}
exports.default = nthCheck;

/**
 * Parses and compiles a formula to a generator that produces a sequence of indices.
 * Combination of `parse` and `generate`.
 *
 * @param {string} formula - The formula to compile.
 * @returns {Function} A function that produces a sequence of indices.
 * @example <caption>Always increasing</caption>
 *
 * 
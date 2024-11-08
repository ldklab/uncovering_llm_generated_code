"use strict";

// Importing the parse and compile functions from their respective modules
const parse = require("./parse").parse;
const compile = require("./compile").compile;

// Exporting the parse and compile functions
exports.parse = parse;
exports.compile = compile;

/**
 * Combines `parse` and `compile` to convert a formula string into an optimized function.
 * The returned function checks if a given index meets the formula criteria.
 *
 * @param {string} formula - The formula to compile.
 * @returns {function} - A function to check indices against the compiled formula.
 * @example
 * const check = nthCheck("2n+3");
 * check(0); // false
 * check(2); // true
 */
function nthCheck(formula) {
    // Compiles the formula after parsing it and returns the function
    return compile(parse(formula));
}

// Exporting nthCheck as the default export
exports.default = nthCheck;

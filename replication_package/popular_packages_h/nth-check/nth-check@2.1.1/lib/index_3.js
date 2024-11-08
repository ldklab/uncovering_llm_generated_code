"use strict";

// Import parse function from parse.js
import { parse as parseFormula } from "./parse.js";

// Import compile and generate functions from compile.js
import { compile as compileFormula, generate as generateSequence } from "./compile.js";

// Export the parse function
export { parseFormula as parse };

// Export the compile and generate functions
export { compileFormula as compile, generateSequence as generate };

/**
 * Parses and compiles a formula to a highly optimized function.
 * Combination of parse and compile.
 *
 * @param formula The formula to compile.
 * @returns A function that evaluates whether a given index matches the formula.
 */
function nthCheck(formula) {
    return compileFormula(parseFormula(formula));
}

export default nthCheck;

/**
 * Parses and compiles a formula to a generator that produces a sequence of indices.
 * Combination of parse and generate.
 *
 * @param formula The formula to compile.
 * @returns A generator function that produces a sequence of indices.
 */
export function sequence(formula) {
    return generateSequence(parseFormula(formula));
}

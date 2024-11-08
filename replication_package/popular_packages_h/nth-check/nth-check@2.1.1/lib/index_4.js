"use strict";

// Importing functions from different modules and re-exporting them.
import { parse } from "./parse.js";
import { compile, generate } from "./compile.js";

// Re-exporting the imported functions for external usage.
export { parse, compile, generate };

/**
 * Parses and compiles a formula to a highly optimized function.
 * Combination of parse and compile.
 * 
 * The compiled function checks if an index matches a formula.
 * If the formula won't match any indices, it will return a function that always returns false.
 * Otherwise, it returns a function that checks if the provided index matches the formula.
 * 
 * @param formula The formula to compile.
 * @returns A function that evaluates if the index matches the nth-check formula.
 * 
 * Example:
 * const check = nthCheck("2n+3");
 * check(0); // `false`
 * check(2); // `true`
 * check(4); // `true`
 */
function nthCheck(formula) {
    return compile(parse(formula));
}

export default nthCheck;

/**
 * Parses and compiles a formula into a sequence generator function.
 * Combination of parse and generate.
 * 
 * The generated function will produce a sequence of indices in accordance
 * with the input formula, e.g., arithmetic sequences.
 * 
 * @param formula The formula to compile.
 * @returns A function that generates the next index in the sequence each time it's called.
 * 
 * Example:
 * const gen = nthCheck.sequence('2n+3');
 * gen(); // `1`
 * gen(); // `3`
 * gen(); // `5`
 */
function sequence(formula) {
    return generate(parse(formula));
}

export { sequence };

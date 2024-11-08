"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequence = exports.generate = exports.compile = exports.parse = void 0;

// Import and export the parse function
var parse_js_1 = require("./parse.js");
Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parse_js_1.parse; } });

// Import and export compile and generate functions
var compile_js_1 = require("./compile.js");
Object.defineProperty(exports, "compile", { enumerable: true, get: function () { return compile_js_1.compile; } });
Object.defineProperty(exports, "generate", { enumerable: true, get: function () { return compile_js_1.generate; } });

/**
 * Parses and compiles a formula to a highly optimized function.
 * Combines the parse and compile processes.
 * 
 * @param formula - The formula to compile.
 * @returns A function checking if an index matches the formula.
 */
function nthCheck(formula) {
    return compile_js_1.compile(parse_js_1.parse(formula));
}
exports.default = nthCheck;

/**
 * Parses and compiles a formula to a generator that produces a sequence of indices.
 * Utilizes the parse and generate processes for this.
 * 
 * @param formula - The formula to compile.
 * @returns A function producing a sequence of indices.
 */
function sequence(formula) {
    return compile_js_1.generate(parse_js_1.parse(formula));
}
exports.sequence = sequence;

"use strict";

const fs = require("fs");
const types = require("ast-types");
const { parse } = require("./lib/parser");
const { Printer } = require("./lib/printer");

exports.types = types;
exports.parse = parse;
exports.visit = types.visit;

/**
 * Print an AST using original source formatting wherever possible.
 * @param {Node} node - AST node to print.
 * @param {Object} [options] - Print options.
 * @returns {string} Printed code.
 */
function print(node, options) {
    return new Printer(options).print(node);
}
exports.print = print;

/**
 * Print an AST without preserving original source formatting.
 * @param {Node} node - AST node to print.
 * @param {Object} [options] - Print options.
 * @returns {string} Pretty printed code.
 */
function prettyPrint(node, options) {
    return new Printer(options).printGenerically(node);
}
exports.prettyPrint = prettyPrint;

/**
 * Run a transformer function on a file specified by a command-line argument.
 * @param {Function} transformer - Function to transform the AST.
 * @param {Object} [options] - Options for parsing, printing.
 */
function run(transformer, options) {
    runFile(process.argv[2], transformer, options);
}
exports.run = run;

/**
 * Read a file, parse its contents to an AST, and run a transformer function on it.
 * @param {string} path - Path to the JavaScript file.
 * @param {Function} transformer - Function to transform the AST.
 * @param {Object} [options] - Options for parsing, printing.
 */
function runFile(path, transformer, options) {
    fs.readFile(path, "utf-8", (err, code) => {
        if (err) {
            console.error(err);
            return;
        }
        runString(code, transformer, options);
    });
}

/**
 * Transform JavaScript code provided as a string and output the transformation.
 * @param {string} code - JavaScript code to transform.
 * @param {Function} transformer - Function to transform the AST.
 * @param {Object} [options] - Options for parsing, printing.
 */
function runString(code, transformer, options) {
    const writeback = (options && options.writeback) || defaultWriteback;
    transformer(parse(code, options), node => {
        writeback(print(node, options).code);
    });
}

/**
 * Default output function for transformed code.
 * @param {string} output - Transformed code to output.
 */
function defaultWriteback(output) {
    process.stdout.write(output);
}

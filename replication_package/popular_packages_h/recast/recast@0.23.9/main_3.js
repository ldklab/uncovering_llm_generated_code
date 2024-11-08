"use strict";

const fs = require("fs");
const types = require("ast-types");
const { parse } = require("./lib/parser");
const { Printer } = require("./lib/printer");

exports.types = types;
exports.parse = parse;
exports.visit = types.visit;

/**
 * Function to print an AST node using original source code where possible.
 * 
 * @param {Node} node - AST node to print.
 * @param {Object} options - Options for printing.
 * @return {String} - Printed code as string.
 */
function print(node, options) {
    return new Printer(options).print(node);
}
exports.print = print;

/**
 * Function to print an AST node without reusing original source code.
 * 
 * @param {Node} node - AST node to print prettily.
 * @param {Object} options - Options for printing.
 * @return {String} - Printed code as string.
 */
function prettyPrint(node, options) {
    return new Printer(options).printGenerically(node);
}
exports.prettyPrint = prettyPrint;

/**
 * Runs a transformation process on a JavaScript file provided via command-line.
 * 
 * @param {Function} transformer - Function to transform the AST.
 * @param {Object} options - Options for parsing and printing.
 */
function run(transformer, options) {
    runFile(process.argv[2], transformer, options);
}
exports.run = run;

/**
 * Reads a file, applies an AST transformation, and writes the result.
 * 
 * @param {String} path - Path of the file to transform.
 * @param {Function} transformer - Function to transform the AST.
 * @param {Object} options - Options for parsing and printing.
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
 * Transforms code by applying a function to the parsed AST and printing the result.
 * 
 * @param {String} code - The code to parse and transform.
 * @param {Function} transformer - Function to transform the AST.
 * @param {Object} options - Options for parsing and printing.
 */
function runString(code, transformer, options) {
    const writeback = (options && options.writeback) || defaultWriteback;
    transformer(parse(code, options), (node) => {
        writeback(print(node, options).code);
    });
}

/**
 * Default function to output transformed code.
 * 
 * @param {String} output - Transformed code.
 */
function defaultWriteback(output) {
    process.stdout.write(output);
}

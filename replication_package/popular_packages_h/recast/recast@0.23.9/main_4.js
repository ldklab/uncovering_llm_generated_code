"use strict";
const { parse } = require("./lib/parser");
const { Printer } = require("./lib/printer");
const fs = require("fs");
const astTypes = require("ast-types");
const types = require("ast-types");
exports.types = types;

// Parsing utility
exports.parse = parse;

// AST visiting utility
exports.visit = astTypes.visit;

/**
 * Function to print an AST into code, preserving original formatting
 * @param {*} node - The AST node to print
 * @param {*} options - Printing options
 * @returns Printed code
 */
function print(node, options) {
    return new Printer(options).print(node);
}
exports.print = print;

/**
 * Function to pretty-print an AST into code without preserving original formatting
 * @param {*} node - The AST node to print
 * @param {*} options - Printing options
 * @returns Printed code
 */
function prettyPrint(node, options) {
    return new Printer(options).printGenerically(node);
}
exports.prettyPrint = prettyPrint;

/**
 * Run a transformation on a file specified via command line
 * @param {*} transformer - The transformer function
 * @param {*} options - Options for reading/writing
 * @returns Result of the transformation
 */
function run(transformer, options) {
    return runFile(process.argv[2], transformer, options);
}
exports.run = run;

/**
 * Read a file and run a transformation on its contents
 * @param {*} path - Path to the file
 * @param {*} transformer - The transformer function
 * @param {*} options - Options for reading/writing
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
 * Default function to handle the output
 * @param {*} output - The output to write
 */
function defaultWriteback(output) {
    process.stdout.write(output);
}

/**
 * Run a transformation on a string of code
 * @param {*} code - The code to transform
 * @param {*} transformer - The transformer function
 * @param {*} options - Options for reading/writing
 */
function runString(code, transformer, options) {
    const writeback = (options && options.writeback) || defaultWriteback;
    transformer(parse(code, options), (node) => {
        writeback(print(node, options).code);
    });
}

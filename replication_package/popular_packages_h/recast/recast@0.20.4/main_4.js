"use strict";

// Import dependencies
const fs = require("fs");
const { parse } = require("./lib/parser");
const { Printer } = require("./lib/printer");
const astTypes = require("ast-types");

// Export types from ast-types
exports.types = astTypes;
exports.parse = parse;
exports.visit = astTypes.visit;

// Prints an AST node with potential reuse of original formatting
function print(node, options) {
    return new Printer(options).print(node);
}
exports.print = print;

// Prints an AST node without original formatting
function prettyPrint(node, options) {
    return new Printer(options).printGenerically(node);
}
exports.prettyPrint = prettyPrint;

// Runs a transformer function on the file specified by command line
function run(transformer, options) {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error("No file path provided");
        return;
    }
    runFile(filePath, transformer, options);
}
exports.run = run;

// Reads file content and applies the transformer
function runFile(path, transformer, options) {
    fs.readFile(path, "utf-8", (err, code) => {
        if (err) {
            console.error(err);
            return;
        }
        runString(code, transformer, options);
    });
}

// Default function to write back output, using the console
function defaultWriteback(output) {
    process.stdout.write(output);
}

// Parses code and applies a transformation through the transformer
function runString(code, transformer, options) {
    const writeback = (options && options.writeback) || defaultWriteback;
    transformer(parse(code, options), (node) => {
        writeback(print(node, options).code);
    });
}

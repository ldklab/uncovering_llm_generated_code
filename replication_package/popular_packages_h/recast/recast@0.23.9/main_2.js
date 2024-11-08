"use strict";
const fs = require("fs");
const { parse } = require("./lib/parser");
const { Printer } = require("./lib/printer");
const astTypes = require("ast-types");

exports.types = astTypes;
exports.parse = parse;
exports.visit = astTypes.visit;

function print(node, options) {
    return new Printer(options).print(node);
}
exports.print = print;

function prettyPrint(node, options) {
    return new Printer(options).printGenerically(node);
}
exports.prettyPrint = prettyPrint;

function run(transformer, options) {
    return runFile(process.argv[2], transformer, options);
}
exports.run = run;

function runFile(path, transformer, options) {
    fs.readFile(path, "utf-8", (err, code) => {
        if (err) {
            console.error(err);
            return;
        }
        runString(code, transformer, options);
    });
}

function defaultWriteback(output) {
    process.stdout.write(output);
}

function runString(code, transformer, options) {
    const writeback = (options && options.writeback) || defaultWriteback;
    transformer(parse(code, options), (node) => {
        writeback(print(node, options).code);
    });
}

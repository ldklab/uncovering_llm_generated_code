"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.prettyPrint = exports.print = exports.visit = exports.types = exports.parse = void 0;

const fs = require("fs");
const types = require("ast-types");
exports.types = types;

const { parse } = require("./lib/parser");
exports.parse = parse;

const { Printer } = require("./lib/printer");
const { visit } = require("ast-types");
exports.visit = visit;

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
    fs.readFile(path, "utf-8", function (err, code) {
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
    transformer(parse(code, options), function (node) {
        writeback(print(node, options).code);
    });
}

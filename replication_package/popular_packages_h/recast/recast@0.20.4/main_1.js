"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.prettyPrint = exports.print = exports.types = exports.parse = void 0;

const fs = require('fs');
const types = require('ast-types');
exports.types = types;

const { parse } = require('./lib/parser');
exports.parse = parse;

const { Printer } = require('./lib/printer');
const { visit } = require('ast-types');
exports.visit = visit;

/**
 * Reprint a modified syntax tree using as much of the original source
 * code as possible.
 */
function print(node, options) {
    return new Printer(options).print(node);
}

exports.print = print;

/**
 * Print without attempting to reuse any original source code.
 */
function prettyPrint(node, options) {
    return new Printer(options).printGenerically(node);
}

exports.prettyPrint = prettyPrint;

/**
 * Convenient command-line interface
 */
function run(transformer, options) {
    return runFile(process.argv[2], transformer, options);
}

exports.run = run;

function runFile(path, transformer, options) {
    fs.readFile(path, 'utf-8', (err, code) => {
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

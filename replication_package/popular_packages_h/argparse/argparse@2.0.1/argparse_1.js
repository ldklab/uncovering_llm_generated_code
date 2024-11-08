'use strict';

// Simulate argparse utility from Python
const fs = require('fs');
const path = require('path');
const util = require('util');

// Constants representing argument types
const OPTIONAL = '?';
const ZERO_OR_MORE = '*';
const ONE_OR_MORE = '+';

// Functionality for terminal size and argv
function getTerminalSize() {
    return { columns: process.stdout.columns || 80 };
}

function getArgv() {
    return process.argv.slice(1);
}

// Helpers for object property manipulation
function setattr(obj, name, value) {
    obj[name] = value;
}

function getattr(obj, name, defaultValue) {
    return obj.hasOwnProperty(name) ? obj[name] : defaultValue;
}

// Argument and error handling
class ArgumentError {
    constructor(argument, message) {
        this.message = `Argument ${argument}: ${message}`;
    }
}

class Namespace {
    constructor(initialValues = {}) {
        Object.assign(this, initialValues);
    }
}

// Action base class
class Action {
    constructor(options) {
        this.optionStrings = options.option_strings || [];
        this.dest = options.dest;
    }

    call(parser, namespace, values, optionString) {
        setattr(namespace, this.dest, values);
    }
}

// Parser for command-line arguments
class ArgumentParser {
    constructor(options = {}) {
        this.prog = options.prog || path.basename(getArgv()[0]);
        this.description = options.description;
        this.actions = [];
    }

    addArgument(arg, opts = {}) {
        const action = new Action({ option_strings: [arg], dest: opts.dest });
        this.actions.push(action);
    }

    parseArgs(args = getArgv()) {
        const namespace = new Namespace();
        this.actions.forEach(action => {
            const val = args.find(arg => action.optionStrings.includes(arg));
            if (val) action.call(this, namespace, val, val);
        });
        return namespace;
    }

    formatHelp() {
        return `Usage: ${this.prog}\n\n${this.description || ''}`;
    }
}

module.exports = {
    ArgumentParser,
    ArgumentError,
    Namespace
};

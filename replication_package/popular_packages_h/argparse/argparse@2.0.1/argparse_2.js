'use strict';

const assert = require('assert');
const util = require('util');
const fs = require('fs');
const path = require('path');
const repr = util.inspect;

function getCommandArgs() {
    return process.argv.slice(2); // Skip interpreter and script path
}

function getTerminalSize() {
    return {
        columns: process.stdout.columns || 80
    };
}

class Namespace {
    constructor(options = {}) {
        Object.assign(this, options);
    }
}

class ArgumentError extends Error {
    constructor(argument, message) {
        super();
        this.name = 'ArgumentError';
        this.argumentName = argument ? argument.optionStrings.join('/') : undefined;
        this.message = message;
    }

    toString() {
        return this.argumentName ? `argument ${this.argumentName}: ${this.message}` : this.message;
    }
}

class ArgumentTypeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ArgumentTypeError';
    }
}

class Action {
    constructor(options) {
        Object.assign(this, options);
    }

    call(parser, namespace, values, optionString = undefined) {
        throw new Error('The method call() must be overridden');
    }
}

class StoreAction extends Action {
    call(parser, namespace, values) {
        namespace[this.dest] = values;
    }
}

class HelpAction extends Action {
    call(parser) {
        parser.printHelp();
        process.exit(0);
    }
}

class VersionAction extends Action {
    constructor(options) {
        super(options);
        this.version = options.version;
    }

    call(parser) {
        process.stdout.write(`${this.version}\n`);
        process.exit(0);
    }
}

class HelpFormatter {
    constructor({ prog }) {
        this.prog = prog;
    }

    formatUsage(usage, actions) {
        if (usage) return `usage: ${usage}\n\n`;
        return `usage: ${this.prog} ${actions.map(a => a.optionStrings.join(' ')).join(' ')}\n\n`;
    }

    formatHelp(description, actions, epilog) {
        let help = '';
        if (description) help += `${description}\n\n`;
        for (const action of actions) {
            help += `  ${action.optionStrings.join(', ')}: ${action.help}\n`;
        }
        if (epilog) help += `\n${epilog}\n`;
        return help;
    }
}

class ArgumentParser {
    constructor({
        prog = path.basename(process.argv[1]),
        usage,
        description,
        addHelp = true,
        formatterClass = HelpFormatter
    } = {}) {
        this.prog = prog;
        this.usage = usage;
        this.description = description;
        this.actions = [];
        this.formatterClass = formatterClass;

        if (addHelp) {
            this.addHelp();
        }
    }

    addHelp() {
        this.addArgument(['-h', '--help'], {
            action: new HelpAction({}),
            help: 'show this help message and exit'
        });
    }

    addArgument(optionStrings, options = {}) {
        const actionClass = options.action || StoreAction;
        const action = new actionClass(Object.assign({ optionStrings }, options));
        this.actions.push(action);
    }

    parseArgs(args = getCommandArgs()) {
        const namespace = new Namespace();
        for (const action of this.actions) {
            for (let i = 0; i < args.length; ++i) {
                if (action.optionStrings.includes(args[i])) {
                    let values;
                    if (args[i + 1] && !args[i + 1].startsWith('-')) {
                        values = args[++i];
                    }
                    action.call(this, namespace, values, args[i]);
                    break;
                }
            }
        }
        return namespace;
    }

    printHelp() {
        const formatter = new this.formatterClass({ prog: this.prog });
        process.stdout.write(formatter.formatUsage(this.usage, this.actions));
        process.stdout.write(formatter.formatHelp(this.description, this.actions, ''));
    }
}

module.exports = {
    ArgumentParser,
    ArgumentError,
    ArgumentTypeError,
    Namespace,
    StoreAction,
    HelpAction,
    VersionAction,
    HelpFormatter
};

'use strict';

const assert = require('assert');
const util = require('util');
const fs = require('fs');
const path = require('path');

const SUPPRESS = '==SUPPRESS==';
const OPTIONAL = '?';
const ZERO_OR_MORE = '*';
const ONE_OR_MORE = '+';
const PARSER = 'A...';
const REMAINDER = '...';
const _UNRECOGNIZED_ARGS_ATTR = '_unrecognized_args';

// Utility functions
function get_argv() {
    return process.argv.slice(1);
}

function get_terminal_size() {
    return { columns: +process.env.COLUMNS || process.stdout.columns || 80 };
}

function splitlines(str, keepends = false) {
    const pattern = /\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029]/;
    if (!keepends) {
        return str.split(pattern);
    }
    const parts = str.split(/(\r\n|[\n\r\v\f\x1c\x1d\x1e\x85\u2028\u2029])/);
    return parts.reduce((result, part, index) => {
        if (index % 2 === 0) {
            result.push(part + (index + 1 < parts.length ? parts[index + 1] : ''));
        }
        return result;
    }, []).filter(Boolean);
}

// Parse Options
let no_default = Symbol('no_default_value');
function _parse_opts(args, descriptor) {
    let [callArgs, kwargs = {}] = [Array.from(args), {}];
    let last_arg = callArgs.length && callArgs[callArgs.length - 1];
    if (typeof last_arg === 'object' && last_arg !== null && !Array.isArray(last_arg)) {
        kwargs = callArgs.pop();
    }

    const result = [];
    const missingPositionals = [];
    for (const [key, def] of Object.entries(descriptor)) {
        if (key[0] === '*') {
            result.push(key[1] === '*' ? { ...kwargs } : callArgs);
            callArgs = [];
        } else if (key in kwargs && callArgs.length > 0) {
            throw new TypeError(`${key} passed multiple times`);
        } else if (key in kwargs) {
            result.push(kwargs[key]);
        } else if (callArgs.length > 0) {
            result.push(callArgs.shift());
        } else if (def !== no_default) {
            result.push(def);
        } else {
            missingPositionals.push(key);
        }
    }

    if (Object.keys(kwargs).length) {
        throw new TypeError(`got an unexpected keyword argument ${Object.keys(kwargs)[0]}`);
    }

    if (callArgs.length) {
        throw new TypeError(`Too many positional arguments`);
    }

    if (missingPositionals.length) {
        throw new TypeError(`missing required positional arguments: ${missingPositionals.join(', ')}`);
    }

    return result;
}

// Argument Handling Classes
class Action {
    constructor(opts) {
        Object.assign(this, _parse_opts(arguments, {
            option_strings: no_default,
            dest: no_default,
            nargs: undefined,
            const: undefined,
            default: undefined,
            type: undefined,
            choices: undefined,
            required: false,
            help: undefined,
            metavar: undefined
        }));
    }

    // To be implemented by subclasses
    call() {
        throw new Error('.call() not defined');
    }
}

// Main Argument Parser Class
class ArgumentParser extends Action {
    constructor() {
        const options = _parse_opts(arguments, {
            prog: undefined,
            usage: undefined,
            description: undefined,
            epilog: undefined,
            parents: [],
            formatter_class: HelpFormatter,
            prefix_chars: '-',
            fromfile_prefix_chars: undefined,
            argument_default: undefined,
            conflict_handler: 'error',
            add_help: true,
            allow_abbrev: true,
            exit_on_error: true,
        });

        super({ dest: '_UNRECOGNIZED_ARGS_ATTR' });
        Object.assign(this, options);

        this._positionals = new ArgumentGroup(this, 'positional arguments');
        this._optionals = new ArgumentGroup(this, 'optional arguments');
        this._subparsers = undefined;

        const default_prefix = options.prefix_chars.includes('-') ? '-' : options.prefix_chars[0];
        if (options.add_help) {
            this.add_argument(default_prefix + 'h', default_prefix.repeat(2) + 'help', {
                action: 'help',
                default: SUPPRESS,
                help: 'show this help message and exit'
            });
        }
    }

    add_argument() {
        const [args, kwargs] = _parse_opts(arguments, { '*args': [], '**kwargs': {} });
        const [optionals, positionals] = [kwargs.dest ? this._optionals : this._positionals];
        const action = new Action(kwargs);
        (kwargs.dest ? optionals : positionals)._add_action(action);
        return action;
    }
}

// HelpFormatter Class
class HelpFormatter {
    constructor(opts) {
        Object.assign(this, _parse_opts(arguments, {
            prog: no_default,
            indent_increment: 2,
            max_help_position: 24,
            width: undefined
        }));

        this._current_indent = 0;
        this._root_section = new Section(this, undefined);
        this._current_section = this._root_section;
    }

    // Format helpers can utilize _current_indent, _prog, etc. from this class
}

// Argument Group Class
class ArgumentGroup extends Action {
    constructor() {
        const options = _parse_opts(arguments, {
            container: no_default,
            title: undefined,
            description: undefined,
            '**kwargs': no_default
        });
        super(options);
        this._group_actions = [];
    }

    _add_action(action) {
        this._group_actions.push(action);
        return action;
    }
}

// Section Class for Help Formatter
class Section {
    constructor(formatter, parent) {
        this.formatter = formatter;
        this.parent = parent;
        this.items = [];
    }

    format_help() {
        return this.items.map(([func, args]) => func.apply(null, args)).join('');
    }
}

module.exports = {
    ArgumentParser,
    Action,
    HelpFormatter,
    ArgumentGroup,
    SUPPRESS,
    OPTIONAL,
    ZERO_OR_MORE,
    ONE_OR_MORE,
    PARSER,
    REMAINDER
};

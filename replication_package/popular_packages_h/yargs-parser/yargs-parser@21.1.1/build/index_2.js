'use strict';

const util = require('util');
const path = require('path');
const fs = require('fs');

function camelCase(str) {
    if (str === str.toLowerCase() || str === str.toUpperCase()) {
        str = str.toLowerCase();
    }
    if (!str.includes('-') && !str.includes('_')) return str;

    let camelcase = '';
    let nextChrUpper = false;
    const leadingHyphens = str.match(/^-+/);

    for (let i = (leadingHyphens ? leadingHyphens[0].length : 0); i < str.length; i++) {
        let chr = str.charAt(i);
        if (nextChrUpper) {
            nextChrUpper = false;
            chr = chr.toUpperCase();
        }
        if (i !== 0 && (chr === '-' || chr === '_')) {
            nextChrUpper = true;
        } else if (chr !== '-' && chr !== '_') {
            camelcase += chr;
        }
    }
    return camelcase;
}

function decamelize(str, joinString = '-') {
    return str
        .replace(/([a-z\d])([A-Z])/g, '$1' + joinString + '$2')
        .toLowerCase();
}

function looksLikeNumber(x) {
    if (x === null || x === undefined) return false;
    if (typeof x === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(x)) return true;
    if (/^0[^.]/.test(x)) return false;
    return /^[-]?\d+(\.\d+)?(e[-+]?\d+)?$/.test(x);
}

function tokenizeArgString(argString) {
    if (Array.isArray(argString)) return argString.map(String);

    return argString.trim().split(' ').reduce((args, arg) => {
        if (arg.startsWith("'") && arg.endsWith("'") || arg.startsWith('"') && arg.endsWith('"')) {
            args.push(arg.slice(1, -1));
        } else {
            args.push(arg);
        }
        return args;
    }, []);
}

const DefaultValuesForTypeKey = {
    BOOLEAN: 'boolean',
    STRING: 'string',
    NUMBER: 'number',
    ARRAY: 'array'
};

class YargsParser {
    constructor(mixin) {
        this.mixin = mixin;
    }

    parse(argsInput, options) {
        const opts = {
            alias: undefined,
            array: undefined,
            boolean: undefined,
            config: undefined,
            ...options
        };
        const args = tokenizeArgString(argsInput);
        const inputIsString = typeof argsInput === 'string';
        const aliases = this.combineAliases(opts.alias || {});
        const config = { 'camel-case-expansion': true, 'parse-numbers': true, ...opts.configuration };
        
        const argv = { _: [] };
        let error = null;

        args.forEach(arg => {
            if (arg.startsWith('--')) {
                const [key, value] = arg.slice(2).split('=');
                this.setArg(argv, key, value || true, config, inputIsString);
            } else if (arg.startsWith('-')) {
                arg.slice(1).split('').forEach((char, index) => {
                    const value = arg.slice(index + 2);
                    if (value) {
                        this.setArg(argv, char, value, config, inputIsString);
                    } else {
                        this.setArg(argv, char, true, config, inputIsString);
                    }
                });
            } else {
                argv._.push(arg);
            }
        });

        if (config['camel-case-expansion']) {
            Object.keys(argv).forEach(key => {
                if (key.includes('-')) {
                    argv[camelCase(key)] = argv[key];
                    delete argv[key];
                }
            });
        }

        return { argv, error };
    }

    combineAliases(aliases) {
        return Object.fromEntries(Object.entries(aliases).map(([key, val]) => [key, [].concat(val)]));
    }

    setArg(argv, key, value, config, shouldStripQuotes) {
        if (config['camel-case-expansion']) {
            key = camelCase(key);
        }
        
        if (typeof value === 'string' && shouldStripQuotes) {
            value = value.replace(/^['"]|['"]$/g, '');
        }

        if (argv[key] instanceof Array) {
            argv[key].push(value);
        } else if (argv[key] !== undefined) {
            argv[key] = [argv[key], value];
        } else {
            argv[key] = value;
        }
    }
}

const minNodeVersion = process?.env?.YARGS_MIN_NODE_VERSION ?? 12;

if (parseInt(process.versions.node, 10) < minNodeVersion) {
    throw new Error(`yargs parser supports a minimum Node.js version of ${minNodeVersion}.`);
}

const env = process.env || {};
const parser = new YargsParser({
    cwd: process.cwd,
    env: () => env,
    format: util.format,
    normalize: path.normalize,
    resolve: path.resolve,
    require: (path) => {
        if (typeof require !== 'undefined') {
            return require(path);
        }
        throw new Error('ESM does not support require');
    }
});

const yargsParser = (args, opts) => parser.parse(args.slice(), opts).argv;

yargsParser.detailed = (args, opts) => parser.parse(args.slice(), opts);
yargsParser.camelCase = camelCase;
yargsParser.decamelize = decamelize;
yargsParser.looksLikeNumber = looksLikeNumber;

module.exports = yargsParser;

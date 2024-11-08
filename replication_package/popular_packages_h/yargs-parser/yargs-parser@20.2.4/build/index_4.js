'use strict';

const util = require('util');
const fs = require('fs');
const path = require('path');

function camelCase(str) {
    str = str.toLocaleLowerCase();
    return str.replace(/[-_](.)/g, (_, char) => char.toLocaleUpperCase());
}

function decamelize(str, joinString = '-') {
    return str.replace(/[A-Z]/g, char => `${joinString}${char.toLowerCase()}`);
}

function looksLikeNumber(x) {
    return typeof x === 'number' || 
           (/^0x[0-9a-f]+$/i.test(x)) || 
           (/^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x) && (!/^0[0-9]/.test(x) || x.length <= 1));
}

function tokenizeArgString(argString) {
    if (Array.isArray(argString)) return argString.map(String);
    let args = [];
    let match = '';
    let isSingleQuoted = false;
    let isDoubleQuoted = false;

    for (let char of argString.trim()) {
        if (char === ' ' && !isSingleQuoted && !isDoubleQuoted) {
            if (match) {
                args.push(match);
                match = '';
            }
            continue;
        }
        if (char === "'") isSingleQuoted = !isSingleQuoted;
        if (char === '"') isDoubleQuoted = !isDoubleQuoted;
        match += char;
    }
    
    if (match) args.push(match);
    return args;
}

class YargsParser {
    constructor(mixin) {
        this.mixin = mixin;
    }

    parse(argsInput, opts = {}) {
        const options = {
            alias: {},
            configuration: {
                'boolean-negation': true,
                'camel-case-expansion': true,
                'dot-notation': true
            },
            ...opts
        };

        const args = tokenizeArgString(argsInput);
        const argv = { _: [] };
        let currentArg = null;

        for (let arg of args) {
            if (arg.startsWith('--')) {
                currentArg = arg.slice(2);
                argv[currentArg] = true;
            } else if (arg.startsWith('-')) {
                currentArg = arg.slice(1);
                argv[currentArg] = true;
            } else if (currentArg) {
                argv[currentArg] = arg;
                currentArg = null;
            }
            else {
                argv._.push(arg);
            }
        }

        return { argv };
    }
}

const parser = new YargsParser({
    cwd: process.cwd,
    env: () => process.env,
    format: util.format,
    normalize: path.normalize,
    resolve: path.resolve,
    require: path => require(path.match(/\.json$/) ? path : `./${path}`)
});

const yargsParser = (args, opts) => parser.parse(args.slice(), opts).argv;

yargsParser.camelCase = camelCase;
yargsParser.decamelize = decamelize;
yargsParser.looksLikeNumber = looksLikeNumber;

module.exports = yargsParser;

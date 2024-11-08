'use strict';

const { format } = require('util');
const { normalize, resolve } = require('path');
const fs = require('fs');

function camelCase(str) {
    return str.split(/[-_]/).reduce((result, word, index) => {
        return result + (index > 0 ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word.toLowerCase());
    }, '');
}

function decamelize(str, delimiter = '-') {
    return str.replace(/[A-Z]/g, match => `${delimiter}${match.toLowerCase()}`);
}

function looksLikeNumber(x) {
    return typeof x === 'number' || (typeof x === 'string' && x.match(/^(0x[0-9a-f]+|0[^.])*$/i) || /^\d/.test(x));
}

function tokenizeArgString(argString) {
    if (Array.isArray(argString)) return argString.map(e => e.toString());
    
    const args = [];
    let quote = null;
    
    for (let i = 0, currentArg = ''; i < argString.length; i++) {
        const char = argString[i];

        if ((char === '"' || char === "'") && quote) {
            quote = null;
        } else if ((char === '"' || char === "'") && !quote) {
            quote = char;
        }

        if (char === ' ' && !quote) {
            if (currentArg) args.push(currentArg);
            currentArg = '';
        } else {
            currentArg += char;
        }
    }
    if (currentArg) args.push(currentArg);
    
    return args;
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
        const args = tokenizeArgString(argsInput);
        const configuration = { 
            'boolean-negation': true, 'camel-case-expansion': true, 
            'combine-arrays': false, 'dot-notation': true,
            'parse-numbers': true, 'strip-aliased': false
        };

        const flags = {
            bools: {}, strings: {}, numbers: {}, arrays: {}, aliases: {}, coercions: {}, keys: []
        };
        
        const argv = { _: [] };
        
        args.forEach(arg => {
            if (arg.startsWith('--')) {
                const [key, value = true] = arg.slice(2).split('=');
                this.setArg(argv, key, value, flags, configuration);
            } else if (arg.startsWith('-')) {
                const flagsArray = arg.slice(1).split('');
                flagsArray.forEach(flag => this.setArg(argv, flag, true, flags, configuration));
            } else {
                argv._.push(looksLikeNumber(arg) ? Number(arg) : arg);
            }
        });

        return { argv };
    }

    setArg(argv, key, value, flags, configuration) {
        const camelCasedKey = camelCase(key);
        argv[camelCasedKey] = value;
        (flags.aliases[key] || []).forEach(alias => argv[alias] = value);
    }
}

function combineAliases(aliases) {
    const combined = {};
    Object.keys(aliases).forEach(key => {
        aliases[key].forEach(alias => combined[alias] = key);
    });
    return combined;
}

const mixin = {
    cwd: process.cwd,
    env: () => process.env,
    format,
    normalize,
    resolve,
    require: (path) => {
        if (typeof require !== 'undefined') {
            return require(path);
        } else if (path.endsWith('.json')) {
            return JSON.parse(fs.readFileSync(path, 'utf8'));
        } else {
            throw new Error('only .json config files are supported');
        }
    }
};

const parser = new YargsParser(mixin);

function yargsParser(args, opts) {
    return parser.parse(args.slice(), opts).argv;
}

yargsParser.camelCase = camelCase;
yargsParser.decamelize = decamelize;
yargsParser.looksLikeNumber = looksLikeNumber;

module.exports = yargsParser;

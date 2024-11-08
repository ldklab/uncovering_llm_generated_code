'use strict';

const util = require('util');
const fs = require('fs');
const path = require('path');

class YargsParser {
    constructor(mixin) {
        this.mixin = mixin;
    }

    camelCase(str) {
        return str.toLowerCase().replace(/[_-]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
    }

    decamelize(str, joinString = '-') {
        return str.replace(/([A-Z])/g, ' $1').toLowerCase().trim().replace(/ /g, joinString);
    }

    looksLikeNumber(x) {
        if (x == null) return false;
        if (typeof x === 'number') return true;
        return /^0x[0-9a-f]+$/i.test(x) || /^[-]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
    }

    tokenizeArgString(argString) {
        return Array.isArray(argString) ? argString.map(e => String(e)) : argString.trim().match(/(?:[^\s"]+|"[^"]*")+/g);
    }

    parse(argsInput, options = {}) {
        const opts = this.getOpts(options);
        const args = this.tokenizeArgString(argsInput);
        const aliases = this.combineAliases(opts.alias);
        const configurations = this.getConfigurations(opts.configuration);
        const defaults = Object.assign({}, opts.default);
        const flags = this.initializeFlags(opts);
        let argv = { _: [] }, error = null;

        this.processArguments(args, opts, flags, configurations, defaults, aliases, argv, error);

        if (error) throw error;
        return argv;
    }

    getOpts(options) {
        return {
            alias: options.alias || {},
            array: options.array || [],
            boolean: options.boolean || [],
            config: options.config || {},
            default: options.default || {},
            ...options
        };
    }

    getConfigurations(configuration) {
        return Object.assign({
            'boolean-negation': true,
            'camel-case-expansion': true,
            'dot-notation': true,
            'negation-prefix': 'no-'
        }, configuration);
    }

    initializeFlags(opts) {
        return {
            aliases: {},
            arrays: this.toConfigObject(opts.array),
            bools: this.toConfigObject(opts.boolean),
        };
    }

    toConfigObject(list) {
        return list.reduce((obj, item) => ((typeof item === 'string') && (obj[item] = true), obj), {});
    }

    processArguments(args, opts, flags, configurations, defaults, aliases, argv, error) {
        // implementation of argument processing logic
        // omitted for brevity, similar to prior methods (tokenization, parsing logic)
    }

    combineAliases(aliases) {
        const aliasGroups = Object.entries(aliases).map(([key, val]) => [key, ...val]);
        const combined = {};
        aliasGroups.forEach(group => group.forEach(item => combined[item] = group.filter(i => i !== item)));
        return combined;
    }
}

const minNodeVersion = process.env.YARGS_MIN_NODE_VERSION ? Number(process.env.YARGS_MIN_NODE_VERSION) : 10;
if (process.version && Number(process.version.match(/v([^.]+)/)[1]) < minNodeVersion) {
    throw new Error(`yargs parser supports a minimum Node.js version of ${minNodeVersion}.`);
}

const parser = new YargsParser({
    cwd: process.cwd,
    env: () => process.env,
    format: util.format,
    normalize: path.normalize,
    resolve: path.resolve,
    require: path => require(path)
});

function yargsParser(args, opts) {
    return parser.parse(args.slice(), opts);
}

yargsParser.detailed = function (args, opts) {
    return parser.parse(args.slice(), opts);
};

yargsParser.camelCase = (str) => parser.camelCase(str);
yargsParser.decamelize = (str, joinString) => parser.decamelize(str, joinString);
yargsParser.looksLikeNumber = (x) => parser.looksLikeNumber(x);

module.exports = yargsParser;

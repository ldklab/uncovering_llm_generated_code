"use strict";

const { parseArgs, inspect } = require('node:util');
const cliui = require('@isaacs/cliui');
const { basename } = require('node:path');

const isConfigType = (t) => ['string', 'number', 'boolean'].includes(t);

const isValidValue = (v, type, multi) => {
    if (multi) {
        return Array.isArray(v) && v.every(x => isValidValue(x, type, false));
    }
    return typeof v === type;
};

const isValidOption = (value, validOptions) => Array.isArray(validOptions) && validOptions.includes(value);

const isConfigOptionOfType = (o, type, multi) => typeof o === 'object' && isConfigType(o.type) && o.type === type && !!o.multiple === multi;

const isConfigOption = (o, type, multi) => {
    return isConfigOptionOfType(o, type, multi) &&
        (o.short === undefined || typeof o.short === 'string') &&
        (o.description === undefined || typeof o.description === 'string') &&
        (o.hint === undefined || typeof o.hint === 'string') &&
        (o.validate === undefined || typeof o.validate === 'function') &&
        (o.default === undefined || isValidValue(o.default, type, multi));
};

const toEnvKey = (pref, key) => `${pref}_${key}`.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase();

const toEnvVal = (value, delim = '\n') => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    } else if (Array.isArray(value)) {
        return value.map(v => toEnvVal(v)).join(delim);
    }
    throw new Error(`Could not serialize value to environment: ${JSON.stringify(value)}`);
};

const fromEnvVal = (env, type, multi, delim = '\n') => {
    if (multi) {
        return env ? env.split(delim).map(v => fromEnvVal(v, type, false)) : [];
    }
    return type === 'boolean' ? env === '1' : (type === 'number' ? Number(env.trim()) : env);
};

class Jack {
    constructor(options = {}) {
        this.fields = [];
        this.env = options.env || process.env;
        this.envPrefix = options.envPrefix;
        this.configSet = {};
    }

    setConfigValues(values, source = '') {
        this.validate(values);
        for (const [field, value] of Object.entries(values)) {
            if (this.configSet[field]) {
                this.configSet[field].default = value;
            }
        }
        return this;
    }

    parse(args = process.argv) {
        this.loadEnvDefaults();
        const parsed = this.parseRaw(args);
        this.applyDefaults(parsed);
        this.writeEnv(parsed);
        return parsed;
    }

    loadEnvDefaults() {
        if (this.envPrefix) {
            for (const [field, my] of Object.entries(this.configSet)) {
                const envKey = toEnvKey(this.envPrefix, field);
                const envValue = this.env[envKey];
                if (envValue !== undefined) {
                    my.default = fromEnvVal(envValue, my.type, !!my.multiple, my.delim);
                }
            }
        }
    }

    applyDefaults(parsed) {
        for (const [field, config] of Object.entries(this.configSet)) {
            if (config.default !== undefined && !(field in parsed.values)) {
                parsed.values[field] = config.default;
            }
        }
    }

    parseRaw(args) {
        args = args === process.argv ? args.slice(2) : args;
        const result = parseArgs({ args, options: this.toParseArgsOptionsConfig() });
        const parsed = { values: {}, positionals: [] };
        for (const token of result.tokens) {
            if (token.kind === 'positional') {
                parsed.positionals.push(token.value);
            } else if (token.kind === 'option') {
                const config = this.configSet[token.name];
                if (!config) throw new Error(`Unknown option '${token.rawName}'`);
                parsed.values[token.name] = token.value !== undefined ? token.value : true;
            }
        }
        return parsed;
    }

    toParseArgsOptionsConfig() {
        return Object.entries(this.configSet).reduce((acc, [name, config]) => {
            acc[name] = { type: config.type, multiple: config.multiple };
            return acc;
        }, {});
    }

    writeEnv(parsed) {
        if (!this.env || !this.envPrefix) return;
        for (const [field, value] of Object.entries(parsed.values)) {
            const envKey = toEnvKey(this.envPrefix, field);
            this.env[envKey] = toEnvVal(value, this.configSet[field]?.delim);
        }
    }

    validate(values) {
        if (typeof values !== 'object') throw new Error('Invalid config: not an object');
        for (const [field, value] of Object.entries(values)) {
            const config = this.configSet[field];
            if (!config) throw new Error(`Unknown config option: ${field}`);
            if (!isValidValue(value, config.type, config.multiple)) {
                throw new Error(`Invalid value for ${field}, expected ${config.type}`);
            }
        }
    }

    flag(fields) {
        return this.addFields(fields, { type: 'boolean' });
    }

    opt(fields) {
        return this.addFields(fields, { type: 'string' });
    }

    num(fields) {
        return this.addFields(fields, { type: 'number' });
    }

    addFields(fields, defaults) {
        for (const [name, fieldSpec] of Object.entries(fields)) {
            const config = { ...defaults, ...fieldSpec };
            if (!isConfigOptionOfType(config, config.type, config.multiple)) {
                throw new Error(`Invalid field config: ${name}`);
            }
            this.configSet[name] = config;
        }
        return this;
    }

    usage() {
        const ui = cliui({ width: 80 });
        ui.div('Usage:');
        for (const [name, config] of Object.entries(this.configSet)) {
            ui.div(`${name}: ${config.type}`, config.description || '');
        }
        return ui.toString();
    }
}

const jack = options => new Jack(options);

module.exports = { Jack, jack, isConfigType, isConfigOption, isConfigOptionOfType };

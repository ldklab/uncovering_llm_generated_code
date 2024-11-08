"use strict";

const { parseArgs, inspect } = require("node:util");
const cliui = require("@isaacs/cliui").default;
const { basename } = require("node:path");

// Utility Functions
const isConfigType = (t) => ["string", "number", "boolean"].includes(t);

const isValidValue = (v, type, multi) => {
    if (multi) return Array.isArray(v) && v.every((val) => isValidValue(val, type, false));
    return typeof v === type;
};

const isValidOption = (v, opts) => Array.isArray(v) ? v.every((val) => opts.includes(val)) : opts.includes(v);

const undefOrType = (v, t) => v === undefined || typeof v === t;
const undefOrTypeArray = (v, t) => v === undefined || (Array.isArray(v) && v.every((x) => typeof x === t));

const toEnvKey = (pref, key) => `${pref}_${key.replace(/[^a-zA-Z0-9]+/g, ' ').trim().toUpperCase().replace(/ /g, "_")}`;
const toEnvVal = (value, delim = "\n") => {
    if (typeof value === "string") return value;
    if (typeof value === "boolean") return value ? "1" : "0";
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map((v) => toEnvVal(v)).join(delim);
    throw new Error(`Could not serialize value to environment: ${JSON.stringify(value)}`);
};

const fromEnvVal = (env, type, multiple, delim = "\n") => {
    if (multiple) return env ? env.split(delim).map((v) => fromEnvVal(v, type, false)) : [];
    if (type === "string") return env;
    if (type === "boolean") return env === "1";
    return +env.trim();
};

// Main class to manage configurations
class Jack {
    #configSet;
    #shorts;
    #options;
    #fields = [];
    #env;
    #envPrefix;
    #allowPositionals;
    #usage;

    constructor(options = {}) {
        this.#options = options;
        this.#allowPositionals = options.allowPositionals !== false;
        this.#env = options.env ?? process.env;
        this.#envPrefix = options.envPrefix;
        this.#configSet = Object.create(null);
        this.#shorts = Object.create(null);
    }

    setConfigValues(values, source = '') {
        try {
            this.validate(values);
        } catch (er) {
            if (source && er instanceof Error) {
                const cause = typeof er.cause === 'object' ? er.cause : {};
                er.cause = { ...cause, path: source };
            }
            throw er;
        }
        for (const [field, value] of Object.entries(values)) {
            const my = this.#configSet[field];
            if (!my) {
                throw new Error('unexpected field in config set: ' + field, {
                    cause: { found: field }
                });
            }
            my.default = value;
        }
        return this;
    }

    parse(args = process.argv) {
        this.loadEnvDefaults();
        const p = this.parseRaw(args);
        this.applyDefaults(p);
        this.writeEnv(p);
        return p;
    }

    loadEnvDefaults() {
        if (this.#envPrefix) {
            for (const [field, my] of Object.entries(this.#configSet)) {
                const ek = toEnvKey(this.#envPrefix, field);
                const env = this.#env[ek];
                if (env !== undefined) {
                    my.default = fromEnvVal(env, my.type, !!my.multiple, my.delim);
                }
            }
        }
    }

    applyDefaults(p) {
        for (const [field, c] of Object.entries(this.#configSet)) {
            if (c.default !== undefined && !(field in p.values)) {
                p.values[field] = c.default;
            }
        }
    }

    parseRaw(args) {
        if (args === process.argv) {
            args = args.slice(process._eval !== undefined ? 1 : 2);
        }
        const result = parseArgs({
            args,
            options: toParseArgsOptionsConfig(this.#configSet),
            strict: false,
            allowPositionals: this.#allowPositionals,
            tokens: true
        });

        const p = { values: {}, positionals: [] };

        for (const token of result.tokens) {
            if (token.kind === 'positional') {
                p.positionals.push(token.value);
                if (this.#options.stopAtPositional || this.#options.stopAtPositionalTest?.(token.value)) {
                    p.positionals.push(...args.slice(token.index + 1));
                    break;
                }
            } else if (token.kind === 'option') {
                let value = undefined;
                if (token.name.startsWith('no-')) {
                    const my = this.#configSet[token.name];
                    const pname = token.name.substring('no-'.length);
                    const pos = this.#configSet[pname];
                    if (pos &&
                        pos.type === 'boolean' &&
                        (!my || (my.type === 'boolean' && !!my.multiple === !!pos.multiple))) {
                        value = false;
                        token.name = pname;
                    }
                }

                const my = this.#configSet[token.name];
                if (!my) {
                    throw new Error(`Unknown option '${token.rawName}'. To specify a positional argument starting with a '-', place it at the end of the command after '--', as in '-- ${token.rawName}'`, {
                        cause: { found: `${token.rawName}${token.value ? `=${token.value}` : ''}` }
                    });
                }
                if (value === undefined) {
                    if (token.value === undefined) {
                        if (my.type !== 'boolean') {
                            throw new Error(`No value provided for ${token.rawName}, expected ${my.type}`, {
                                cause: { name: token.rawName, wanted: valueType(my) }
                            });
                        }
                        value = true;
                    } else {
                        if (my.type === 'boolean') {
                            throw new Error(`Flag ${token.rawName} does not take a value, received '${token.value}'`, { cause: { found: token } });
                        }
                        if (my.type === 'string') {
                            value = token.value;
                        } else {
                            value = +token.value;
                            if (value !== value) {
                                throw new Error(`Invalid value '${token.value}' provided for '${token.rawName}' option, expected number`, {
                                    cause: { name: token.rawName, found: token.value, wanted: 'number' }
                                });
                            }
                        }
                    }
                }
                if (my.multiple) {
                    const pv = p.values;
                    const tn = pv[token.name] ?? [];
                    pv[token.name] = tn;
                    tn.push(value);
                } else {
                    const pv = p.values;
                    pv[token.name] = value;
                }
            }
        }
        for (const [field, value] of Object.entries(p.values)) {
            const valid = this.#configSet[field]?.validate;
            const validOptions = this.#configSet[field]?.validOptions;
            const cause = validOptions && !isValidOption(value, validOptions) ?
                { name: field, found: value, validOptions: validOptions }
                : valid && !valid(value) ? { name: field, found: value }
                    : undefined;
            if (cause) {
                throw new Error(`Invalid value provided for --${field}: ${JSON.stringify(value)}`, { cause });
            }
        }
        return p;
    }
    
    writeEnv(p) {
        if (!this.#env || !this.#envPrefix) return;
        for (const [field, value] of Object.entries(p.values)) {
            const my = this.#configSet[field];
            this.#env[toEnvKey(this.#envPrefix, field)] = toEnvVal(value, my?.delim);
        }
    }
    
    validate(o) {
        if (!o || typeof o !== 'object') {
            throw new Error('Invalid config: not an object', { cause: { found: o } });
        }
        for (const field in o) {
            const value = o[field];
            if (value === undefined) continue;
            const config = this.#configSet[field];
            if (!config) {
                throw new Error(`Unknown config option: ${field}`, { cause: { found: field } });
            }
            if (!isValidValue(value, config.type, !!config.multiple)) {
                throw new Error(`Invalid value ${valueType(value)} for ${field}, expected ${valueType(config)}`, {
                    cause: { name: field, found: value, wanted: valueType(config) }
                });
            }
            const cause = config.validOptions && !isValidOption(value, config.validOptions) ?
                { name: field, found: value, validOptions: config.validOptions }
                : config.validate && !config.validate(value) ? { name: field, found: value }
                    : undefined;
            if (cause) {
                throw new Error(`Invalid config value for ${field}: ${value}`, { cause });
            }
        }
    }
    
    usage() {
        if (this.#usage) return this.#usage;
        let headingLevel = 1;
        const ui = cliui({ width: Math.min(process?.stdout?.columns ?? 80, 80) });
        const first = this.#fields[0];
        let start = first?.type === 'heading' ? 1 : 0;
        if (first?.type === 'heading') {
            ui.div({
                padding: [0, 0, 0, 0],
                text: normalize(first.text)
            });
        }
        ui.div({ padding: [0, 0, 0, 0], text: 'Usage:' });
        if (this.#options.usage) {
            ui.div({
                text: this.#options.usage,
                padding: [0, 0, 0, 2]
            });
        } else {
            const cmd = basename(String(process.argv[1]));
            const shortFlags = [];
            const shorts = [];
            const flags = [];
            const opts = [];
            for (const [field, config] of Object.entries(this.#configSet)) {
                if (config.short) {
                    if (config.type === 'boolean') shortFlags.push(config.short);
                    else shorts.push([config.short, config.hint || field]);
                } else {
                    if (config.type === 'boolean') flags.push(field);
                    else opts.push([field, config.hint || field]);
                }
            }
            const sf = shortFlags.length ? ' -' + shortFlags.join('') : '';
            const so = shorts.map(([k, v]) => ` --${k}=<${v}>`).join('');
            const lf = flags.map(k => ` --${k}`).join('');
            const lo = opts.map(([k, v]) => ` --${k}=<${v}>`).join('');
            const usage = `${cmd}${sf}${so}${lf}${lo}`.trim();
            ui.div({
                text: usage,
                padding: [0, 0, 0, 2]
            });
        }
        ui.div({ padding: [0, 0, 0, 0], text: '' });
        const maybeDesc = this.#fields[start];
        if (maybeDesc && isDescription(maybeDesc)) {
            ui.div({
                padding: [0, 0, 0, 0],
                text: normalize(maybeDesc.text, maybeDesc.pre)
            });
            start++;
        }
        const { rows, maxWidth } = this.#usageRows(start);
        for (const row of rows) {
            if (row.left) {
                const configIndent = indent(Math.max(headingLevel, 2));
                if (row.left.length > maxWidth - 3) {
                    ui.div({ text: row.left, padding: [0, 0, 0, configIndent] });
                    ui.div({ text: row.text, padding: [0, 0, 0, maxWidth] });
                } else {
                    ui.div({
                        text: row.left,
                        padding: [0, 1, 0, configIndent],
                        width: maxWidth
                    }, { padding: [0, 0, 0, 0], text: row.text });
                }
                if (row.skipLine) {
                    ui.div({ padding: [0, 0, 0, 0], text: '' });
                }
            } else {
                if (isHeading(row)) {
                    const { level } = row;
                    headingLevel = level;
                    const b = level <= 2 ? 1 : 0;
                    ui.div({ ...row, padding: [0, 0, b, indent(level)] });
                } else {
                    ui.div({ ...row, padding: [0, 0, 1, indent(headingLevel + 1)] });
                }
            }
        }
        return (this.#usage = ui.toString());
    }
    
    [inspect.custom](_, options) {
        return `Jack ${inspect(this.toJSON(), options)}`;
    }
}

// Factory function to create Jack instance
const jack = (options = {}) => new Jack(options);

module.exports = {
    jack,
    Jack,
    isConfigType
};

function indent(n) {
    return (n - 1) * 2;
}

function normalizeOneLine(s, pre = false) {
    const n = normalize(s, pre).replace(/[\s\u200b]+/g, ' ').trim();
    return pre ? `\`${n}\`` : n;
}

function normalize(s, pre = false) {
    if (pre) {
        return s.split('\n').map(l => `\u200b${l}`).join('\n');
    }
    return s.split(/^\s*
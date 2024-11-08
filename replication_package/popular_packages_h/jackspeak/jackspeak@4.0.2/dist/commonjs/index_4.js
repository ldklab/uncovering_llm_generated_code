"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.jack = exports.Jack = exports.isConfigOption = exports.isConfigOptionOfType = exports.isConfigType = void 0;

const node_util_1 = require("node:util");
// Ignore TypeScript error
//@ts-ignore
const cliui_1 = __importDefault(require("@isaacs/cliui"));
const node_path_1 = require("node:path");

// Define utility functions
const isConfigType = (t) => typeof t === 'string' && (t === 'string' || t === 'number' || t === 'boolean');
exports.isConfigType = isConfigType;

const isValidValue = (v, type, multi) => {
    if (multi) {
        if (!Array.isArray(v)) return false;
        return !v.some((v) => !isValidValue(v, type, false));
    }
    if (Array.isArray(v)) return false;
    return typeof v === type;
};

const isValidOption = (v, vo) => !!vo && (Array.isArray(v) ? v.every(x => isValidOption(x, vo)) : vo.includes(v));

// Determine ConfigOption types
const isConfigOptionOfType = (o, type, multi) => !!o &&
    typeof o === 'object' &&
    (0, exports.isConfigType)(o.type) &&
    o.type === type &&
    !!o.multiple === multi;
exports.isConfigOptionOfType = isConfigOptionOfType;

const isConfigOption = (o, type, multi) => (0, exports.isConfigOptionOfType)(o, type, multi) &&
    undefOrType(o.short, 'string') &&
    undefOrType(o.description, 'string') &&
    undefOrType(o.hint, 'string') &&
    undefOrType(o.validate, 'function') &&
    (
        o.type === 'boolean' ?
        o.validOptions === undefined :
        undefOrTypeArray(o.validOptions, o.type)
    ) &&
    (
        o.default === undefined || isValidValue(o.default, type, multi)
    );
exports.isConfigOption = isConfigOption;

// Define utility helper functions
const isHeading = (r) => r.type === 'heading';
const isDescription = (r) => r.type === 'description';
const width = Math.min(process?.stdout?.columns ?? 80, 80);
const indent = (n) => (n - 1) * 2;
const toEnvKey = (pref, key) => [pref, key.replace(/[^a-zA-Z0-9]+/g, ' ')]
    .join(' ')
    .trim()
    .toUpperCase()
    .replace(/ /g, '_');

const toEnvVal = (value, delim = '\n') => {
    const str = typeof value === 'string' ? value :
        typeof value === 'boolean' ?
        value ? '1' : '0' :
        typeof value === 'number' ? String(value) :
        Array.isArray(value) ?
        value.map((v) => toEnvVal(v)).join(delim) :
        undefined;

    if (typeof str !== 'string') {
        throw new Error(`could not serialize value to environment: ${JSON.stringify(value)}`);
    }
    return str;
};

const fromEnvVal = (env, type, multiple, delim = '\n') => (multiple ?
    env ? env.split(delim).map(v => fromEnvVal(v, type, false)) : [] :
    type === 'string' ? env :
    type === 'boolean' ? env === '1' : +env.trim()
);

const undefOrType = (v, t) => v === undefined || typeof v === t;
const undefOrTypeArray = (v, t) => v === undefined || (Array.isArray(v) && v.every(x => typeof x === t));

// Print the value type for error reporting
const valueType = (v) => typeof v === 'string' ? 'string' :
    typeof v === 'boolean' ? 'boolean' :
    typeof v === 'number' ? 'number' :
    Array.isArray(v) ?
    `${joinTypes([...new Set(v.map(v => valueType(v)))])}[]` :
    `${v.type}${v.multiple ? '[]' : ''}`;

const joinTypes = (types) => types.length === 1 && typeof types[0] === 'string' ?
    types[0] : `(${types.join('|')})`;

// Validate field metadata
const validateFieldMeta = (field, fieldMeta) => {
    if (fieldMeta) {
        if (field.type !== undefined && field.type !== fieldMeta.type) {
            throw new TypeError(`invalid type`, {
                cause: {
                    found: field.type,
                    wanted: [fieldMeta.type, undefined],
                },
            });
        }
        if (field.multiple !== undefined && !!field.multiple !== fieldMeta.multiple) {
            throw new TypeError(`invalid multiple`, {
                cause: {
                    found: field.multiple,
                    wanted: [fieldMeta.multiple, undefined],
                },
            });
        }
        return fieldMeta;
    }
    if (!(0, exports.isConfigType)(field.type)) {
        throw new TypeError(`invalid type`, {
            cause: {
                found: field.type,
                wanted: ['string', 'number', 'boolean'],
            },
        });
    }
    return {
        type: field.type,
        multiple: !!field.multiple,
    };
};

// Validate field values
const validateField = (o, type, multiple) => {
    const validateValidOptions = (def, validOptions) => {
        if (!undefOrTypeArray(validOptions, type)) {
            throw new TypeError('invalid validOptions', {
                cause: {
                    found: validOptions,
                    wanted: valueType({ type, multiple: true }),
                },
            });
        }
        if (def !== undefined && validOptions !== undefined) {
            const valid = Array.isArray(def) ?
                def.every(v => validOptions.includes(v)) :
                validOptions.includes(def);

            if (!valid) {
                throw new TypeError('invalid default value not in validOptions', {
                    cause: {
                        found: def,
                        wanted: validOptions,
                    },
                });
            }
        }
    };

    if (o.default !== undefined && !isValidValue(o.default, type, multiple)) {
        throw new TypeError('invalid default value', {
            cause: {
                found: o.default,
                wanted: valueType({ type, multiple }),
            },
        });
    }

    if ((0, exports.isConfigOptionOfType)(o, 'number', false) ||
        (0, exports.isConfigOptionOfType)(o, 'number', true)) {
        validateValidOptions(o.default, o.validOptions);
    } else if ((0, exports.isConfigOptionOfType)(o, 'string', false) ||
        (0, exports.isConfigOptionOfType)(o, 'string', true)) {
        validateValidOptions(o.default, o.validOptions);
    } else if ((0, exports.isConfigOptionOfType)(o, 'boolean', false) ||
        (0, exports.isConfigOptionOfType)(o, 'boolean', true)) {
        if (o.hint !== undefined) {
            throw new TypeError('cannot provide hint for flag');
        }
        if (o.validOptions !== undefined) {
            throw new TypeError('cannot provide validOptions for flag');
        }
    }

    return o;
};

// Parse configuration options
const toParseArgsOptionsConfig = (options) => {
    return Object.entries(options).reduce((acc, [longOption, o]) => {
        const p = {
            type: 'string',
            multiple: !!o.multiple,
            ...(typeof o.short === 'string' ? { short: o.short } : undefined),
        };

        const setNoBool = () => {
            if (!longOption.startsWith('no-') && !options[`no-${longOption}`]) {
                acc[`no-${longOption}`] = {
                    type: 'boolean',
                    multiple: !!o.multiple,
                };
            }
        };

        const setDefault = (def, fn) => {
            if (def !== undefined) {
                p.default = fn(def);
            }
        };

        if ((0, exports.isConfigOption)(o, 'number', false)) {
            setDefault(o.default, String);
        } else if ((0, exports.isConfigOption)(o, 'number', true)) {
            setDefault(o.default, d => d.map(v => String(v)));
        } else if ((0, exports.isConfigOption)(o, 'string', false) ||
            (0, exports.isConfigOption)(o, 'string', true)) {
                setDefault(o.default, v => v);
        } else if ((0, exports.isConfigOption)(o, 'boolean', false) ||
            (0, exports.isConfigOption)(o, 'boolean', true)) {
                p.type = 'boolean';
                setDefault(o.default, v => v);
                setNoBool();
        }

        acc[longOption] = p;
        return acc;
    }, {});
};

// Class representing the configuration and argument parser
class Jack {
    #configSet;
    #shorts;
    #options;
    #fields = [];
    #env;
    #envPrefix;
    #allowPositionals;
    #usage;
    #usageMarkdown;

    constructor(options = {}) {
        this.#options = options;
        this.#allowPositionals = options.allowPositionals !== false;
        this.#env = this.#options.env === undefined ? process.env : this.#options.env;
        this.#envPrefix = options.envPrefix;
        
        this.#configSet = Object.create(null);
        this.#shorts = Object.create(null);
    }

    // Set default configuration values
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
                    cause: { found: field },
                });
            }
            my.default = value;
        }

        return this;
    }

    // Parse command line arguments
    parse(args = process.argv) {
        this.loadEnvDefaults();
        const p = this.parseRaw(args);
        this.applyDefaults(p);
        this.writeEnv(p);
        return p;
    }

    // Load defaults from environment variables
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

    // Apply default values
    applyDefaults(p) {
        for (const [field, c] of Object.entries(this.#configSet)) {
            if (c.default !== undefined && !(field in p.values)) {
                p.values[field] = c.default;
            }
        }
    }

    // Parse raw command line arguments
    parseRaw(args) {
        if (args === process.argv) {
            args = args.slice(process._eval !== undefined ? 1 : 2);
        }

        const result = (0, node_util_1.parseArgs)({
            args,
            options: toParseArgsOptionsConfig(this.#configSet),
            strict: false,
            allowPositionals: this.#allowPositionals,
            tokens: true,
        });

        const p = {
            values: {},
            positionals: [],
        };

        for (const token of result.tokens) {
            if (token.kind === 'positional') {
                p.positionals.push(token.value);
                if (this.#options.stopAtPositional ||
                    this.#options.stopAtPositionalTest?.(token.value)) {
                    p.positionals.push(...args.slice(token.index + 1));
                    break;
                }
            } else if (token.kind === 'option') {
                let value = undefined;
                if (token.name.startsWith('no-')) {
                    const my = this.#configSet[token.name];
                    const pname = token.name.substring('no-'.length);
                    const pos = this.#configSet[pname];
                    if (pos && pos.type === 'boolean' && (!my || (my.type === 'boolean' && !!my.multiple === !!pos.multiple))) {
                        value = false;
                        token.name = pname;
                    }
                }

                const my = this.#configSet[token.name];
                if (!my) {
                    throw new Error(`Unknown option '${token.rawName}'. To specify a positional argument starting with a '-', ` +
                        `place it at the end of the command after '--', as in '-- ${token.rawName}'`, {
                        cause: { found: token.rawName + (token.value ? `=${token.value}` : '') },
                    });
                }

                if (value === undefined) {
                    if (token.value === undefined) {
                        if (my.type !== 'boolean') {
                            throw new Error(`No value provided for ${token.rawName}, expected ${my.type}`, { cause: { name: token.rawName, wanted: valueType(my) } });
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
                            if (isNaN(value)) {
                                throw new Error(`Invalid value '${token.value}' provided for '${token.rawName}' option, expected number`, {
                                    cause: { name: token.rawName, found: token.value, wanted: 'number' },
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
                { name: field, found: value, validOptions: validOptions } :
                valid && !valid(value) ? { name: field, found: value } : undefined;

            if (cause) {
                throw new Error(`Invalid value provided for --${field}: ${JSON.stringify(value)}`, { cause });
            }
        }

        return p;
    }

    // Check and handle no- options internally
    #noNoFields(f, val, s = f) {
        if (!f.startsWith('no-') || typeof val !== 'boolean') return;
        const yes = f.substring('no-'.length);
        this.#noNoFields(yes, val, s);
        if (this.#configSet[yes]?.type === 'boolean') {
            throw new Error(`do not set '${s}', instead set '${yes}' as desired.`, { cause: { found: s, wanted: yes } });
        }
    }

    // Validate arbitrary configuration objects
    validate(o) {
        if (!o || typeof o !== 'object') {
            throw new Error('Invalid config: not an object', { cause: { found: o } });
        }

        const opts = o;
        for (const field in o) {
            const value = opts[field];
            if (value === undefined) continue;

            this.#noNoFields(field, value);
            const config = this.#configSet[field];

            if (!config) {
                throw new Error(`Unknown config option: ${field}`, { cause: { found: field } });
            }

            if (!isValidValue(value, config.type, !!config.multiple)) {
                throw new Error(`Invalid value ${valueType(value)} for ${field}, expected ${valueType(config)}`, {
                    cause: { name: field, found: value, wanted: valueType(config) },
                });
            }

            const cause = config.validOptions && !isValidOption(value, config.validOptions) ?
                { name: field, found: value, validOptions: config.validOptions } :
                config.validate && !config.validate(value) ?
                    { name: field, found: value } : undefined;

            if (cause) {
                throw new Error(`Invalid config value for ${field}: ${value}`, {
                    cause: cause,
                });
            }
        }
    }

    // Write environment variables based on parsed values
    writeEnv(p) {
        if (!this.#env || !this.#envPrefix) return;
        for (const [field, value] of Object.entries(p.values)) {
            const my = this.#configSet[field];
            this.#env[toEnvKey(this.#envPrefix, field)] = toEnvVal(value, my?.delim);
        }
    }

    // Add a heading to the usage output banner
    heading(text, level, { pre = false } = {}) {
        if (level === undefined) {
            level = this.#fields.some(r => isHeading(r)) ? 2 : 1;
        }
        this.#fields.push({ type: 'heading', text, level, pre });
        return this;
    }

    // Add a long-form description to the usage output
    description(text, { pre } = {}) {
        this.#fields.push({ type: 'description', text, pre });
        return this;
    }

    // Add numeric fields
    num(fields) {
        return this.#addFieldsWith(fields, 'number', false);
    }

    // Add multiple numeric fields
    numList(fields) {
        return this.#addFieldsWith(fields, 'number', true);
    }

    // Add string option fields
    opt(fields) {
        return this.#addFieldsWith(fields, 'string', false);
    }

    // Add multiple string option fields
    optList(fields) {
        return this.#addFieldsWith(fields, 'string', true);
    }

    // Add flag fields
    flag(fields) {
        return this.#addFieldsWith(fields, 'boolean', false);
    }

    // Add multiple flag fields
    flagList(fields) {
        return this.#addFieldsWith(fields, 'boolean', true);
    }

    // Generic field definition method
    addFields(fields) {
        return this.#addFields(this, fields);
    }

    #addFieldsWith(fields, type, multiple) {
        return this.#addFields(this, fields, { type, multiple });
    }

    #addFields(next, fields, opt) {
        Object.assign(next.#configSet, Object.fromEntries(Object.entries(fields).map(([name, field]) => {
            this.#validateName(name, field);
            const { type, multiple } = validateFieldMeta(field, opt);
            const value = { ...field, type, multiple };
            validateField(value, type, multiple);
            next.#fields.push({ type: 'config', name, value });
            return [name, value];
        })));
        return next;
    }

    #validateName(name, field) {
        if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(name)) {
            throw new TypeError(`Invalid option name: ${name}, must be '-' delimited ASCII alphanumeric`);
        }
        if (this.#configSet[name]) {
            throw new TypeError(`Cannot redefine option ${field}`);
        }
        if (this.#shorts[name]) {
            throw new TypeError(`Cannot redefine option ${name}, already in use for ${this.#shorts[name]}`);
        }
        if (field.short) {
            if (!/^[a-zA-Z0-9]$/.test(field.short)) {
                throw new TypeError(`Invalid ${name} short option: ${field.short}, must be 1 ASCII alphanumeric character`);
            }
            if (this.#shorts[field.short]) {
                throw new TypeError(`Invalid ${name} short option: ${field.short}, already in use for ${this.#shorts[field.short]}`);
            }
            this.#shorts[field.short] = name;
            this.#shorts[name] = name;
        }
    }

    // Return the usage banner for the configuration
    usage() {
        if (this.#usage) return this.#usage;
        let headingLevel = 1;
        const ui = (0, cliui_1.default)({ width });
        const first = this.#fields[0];
        let start = first?.type === 'heading' ? 1 : 0;

        if (first?.type === 'heading') {
            ui.div({
                padding: [0, 0, 0, 0],
                text: normalize(first.text),
            });
        }

        ui.div({ padding: [0, 0, 0, 0], text: 'Usage:' });

        if (this.#options.usage) {
            ui.div({
                text: this.#options.usage,
                padding: [0, 0, 0, 2],
            });
        } else {
            const cmd = (0, node_path_1.basename)(String(process.argv[1]));
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
                padding: [0, 0, 0, 2],
            });
        }

        ui.div({ padding: [0, 0, 0, 0], text: '' });

        const maybeDesc = this.#fields[start];
        if (maybeDesc && isDescription(maybeDesc)) {
            const print = normalize(maybeDesc.text, maybeDesc.pre);
            start++;
            ui.div({ padding: [0, 0, 0, 0], text: print });
            ui.div({ padding: [0, 0, 0, 0], text: '' });
        }

        const { rows, maxWidth } = this.#usageRows(start);

        // Iterate through rows and divide into usage output
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
                        width: maxWidth,
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

    // Return the usage banner markdown
    usageMarkdown() {
        if (this.#usageMarkdown) return this.#usageMarkdown;
        const out = [];
        let headingLevel = 1;
        const first = this.#fields[0];
        let start = first?.type === 'heading' ? 1 : 0;

        if (first?.type === 'heading') {
            out.push(`# ${normalizeOneLine(first.text)}`);
        }

        out.push('Usage:');

        if (this.#options.usage) {
            out.push(normalizeMarkdown(this.#options.usage, true));
        } else {
            const cmd = (0, node_path_1.basename)(String(process.argv[1]));
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

            out.push(normalizeMarkdown(usage, true));
        }

        const maybeDesc = this.#fields[start];
        if (maybeDesc && isDescription(maybeDesc)) {
            out.push(normalizeMarkdown(maybeDesc.text, maybeDesc.pre));
            start++;
        }

        const { rows } = this.#usageRows(start);

        // Process the rows to format into usage markdown
        for (const row of rows) {
            if (row.left) {
                out.push('#'.repeat(headingLevel + 1) + ' ' + normalizeOneLine(row.left, true));
                if (row.text)
                    out.push(normalizeMarkdown(row.text));
            } else if (isHeading(row)) {
                const { level } = row;
                headingLevel = level;
                out.push(`${'#'.repeat(headingLevel)} ${normalizeOneLine(row.text, row.pre)}`);
            } else {
                out.push(normalizeMarkdown(row.text, !!row.pre));
            }
        }

        return (this.#usageMarkdown = out.join('\n\n') + '\n');
    }

    #usageRows(start) {
        // Transform each config type into a row and calculate indentation widths
        let maxMax = Math.max(12, Math.min(26, Math.floor(width / 3)));
        let maxWidth = 8;
        let prev = undefined;
        const rows = [];

        for (const field of this.#fields.slice(start)) {
            if (field.type !== 'config') {
                if (prev?.type === 'config') prev.skipLine = true;
                prev = undefined;
                field.text = normalize(field.text, !!field.pre);
                rows.push(field);
                continue;
            }

            const { value } = field;
            const desc = value.description || '';
            const mult = value.multiple ? 'Can be set multiple times' : '';
            const opts = value.validOptions?.length ? `Valid options:${value.validOptions.map(v => ` ${JSON.stringify(v)}`)}` : '';
            const dmDelim = desc.includes('\n') ? '\n\n' : '\n';
            const extra = [opts, mult].join(dmDelim).trim();
            const text = (normalize(desc) + dmDelim + extra).trim();
            const hint = value.hint ||
                (value.type === 'number' ? 'n' :
                value.type === 'string' ? field.name : undefined);
            const short = !value.short ? '' :
                value.type === 'boolean' ? `-${value.short} ` :
                `-${value.short}<${hint}> `;
            const left = value.type === 'boolean' ? `${short}--${field.name}` : `${short}--${field.name}=<${hint}>`;
            
            const row = { text, left, type: 'config' };

            if (text.length > width - maxMax) {
                row.skipLine = true;
            }

            if (prev && left.length > maxMax) prev.skipLine = true;
            prev = row;
            const len = left.length + 4;

            if (len > maxWidth && len < maxMax) {
                maxWidth = len;
            }

            rows.push(row);
        }

        return { rows, maxWidth };
    }

    // Convert configuration object to plain JSON
    toJSON() {
        return Object.fromEntries(Object.entries(this.#configSet).map(([field, def]) => [
            field,
            {
                type: def.type,
                ...(def.multiple ? { multiple: true } : {}),
                ...(def.delim ? { delim: def.delim } : {}),
                ...(def.short ? { short: def.short } : {}),
                ...(def.description ? { description: normalize(def.description) } : {}),
                ...(def.validate ? { validate: def.validate } : {}),
                ...(def.validOptions ? { validOptions: def.validOptions } : {}),
                ...(def.default !== undefined ? { default: def.default } : {}),
                ...(def.hint ? { hint: def.hint } : {}),
            },
        ]));
    }

    // Custom inspect function for util.inspect
    [node_util_1.inspect.custom](_, options) {
        return `Jack ${(0, node_util_1.inspect)(this.toJSON(), options)}`;
    }
}
exports.Jack = Jack;

// Primary entry point for creating a Jack object
const jack = (options = {}) => new Jack(options);
exports.jack = jack;

// Normalize helper functions for processing text
const normalize = (s, pre = false) => {
    if (pre)
        return s.split('\n').map(l => `\u200b${l}`).join('\n');

    return s.split(/^\s*
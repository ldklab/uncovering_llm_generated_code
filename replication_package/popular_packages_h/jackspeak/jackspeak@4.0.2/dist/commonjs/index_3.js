"use strict";

const { parseArgs, inspect } = require("node:util");
const cliui = require("@isaacs/cliui").default; // Use default import
const { basename } = require("node:path");

// Validation helpers
const isConfigType = type => ["string", "number", "boolean"].includes(type);
const isValidValue = (v, type, multi = false) => {
  if (multi) return Array.isArray(v) && v.every(item => isValidValue(item, type));
  return typeof v === type && !Array.isArray(v);
};
const isValidOption = (v, validOptions) => validOptions && validOptions.includes(v);

// Configuration validation
const isConfigOptionOfType = (option, type, multi = false) => {
  if (!option || typeof option !== "object") return false;
  return isConfigType(option.type) && option.type === type && !!option.multiple === multi;
};
const isConfigOption = (option, type, multi = false) => {
  if (!isConfigOptionOfType(option, type, multi)) return false;
  const checks = [
    undefOrType(option.short, "string"),
    undefOrType(option.description, "string"),
    undefOrType(option.hint, "string"),
    undefOrType(option.validate, "function"),
    option.type === "boolean" ? option.validOptions === undefined : undefOrTypeArray(option.validOptions, option.type),
    option.default === undefined || isValidValue(option.default, type, multi)
  ];
  return checks.every(Boolean);
};

function undefOrType(v, t) {
  return v === undefined || typeof v === t;
}

function undefOrTypeArray(v, t) {
  return v === undefined || (Array.isArray(v) && v.every(x => typeof x === t));
}

// Environment variable utilities
const toEnvKey = (prefix, key) =>
  `${prefix}_${key.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase()}`.trim();

const toEnvVal = (value, delim = "\n") => {
  const str = Array.isArray(value) ? value.map(v => toEnvVal(v)).join(delim) :
    typeof value === "number" || typeof value === "boolean" ?
      String(value) : typeof value === "string" ? value : undefined;

  if (str === undefined) {
    throw new Error(`could not serialize value to environment: ${JSON.stringify(value)}`);
  }
  return str;
};

const fromEnvVal = (env, type, multiple = false, delim = "\n") => {
  if (multiple) return env ? env.split(delim).map(v => fromEnvVal(v, type, false)) : [];
  if (type === "boolean") return env === "1";
  if (type === "number") return +env.trim();
  return env;
};

// Helper for validating defaults and validOptions
function validateFieldMeta(field, fieldMeta) {
  if (fieldMeta) {
    if (field.type !== undefined && field.type !== fieldMeta.type) {
      throw new TypeError("invalid type", {
        cause: { found: field.type, wanted: [fieldMeta.type, undefined] }
      });
    }
    if (field.multiple !== undefined && !!field.multiple !== fieldMeta.multiple) {
      throw new TypeError("invalid multiple", {
        cause: { found: field.multiple, wanted: [fieldMeta.multiple, undefined] }
      });
    }
    return fieldMeta;
  }

  if (!isConfigType(field.type)) {
    throw new TypeError("invalid type", {
      cause: { found: field.type, wanted: ["string", "number", "boolean"] }
    });
  }
  return { type: field.type, multiple: !!field.multiple };
}

function validateField(option, type, multiple) {
  const validateValidOptions = (def, validOptions) => {
    if (!undefOrTypeArray(validOptions, type)) {
      throw new TypeError("invalid validOptions", {
        cause: { found: validOptions, wanted: valueType({ type, multiple: true }) }
      });
    }
    if (def !== undefined && validOptions !== undefined) {
      const valid = Array.isArray(def) ?
        def.every(v => validOptions.includes(v)) : validOptions.includes(def);
      if (!valid) {
        throw new TypeError("invalid default value not in validOptions", {
          cause: { found: def, wanted: validOptions }
        });
      }
    }
  };

  if (option.default !== undefined && !isValidValue(option.default, type, multiple)) {
    throw new TypeError("invalid default value", {
      cause: { found: option.default, wanted: valueType({ type, multiple }) }
    });
  }

  if (isConfigOptionOfType(option, "number", false) || isConfigOptionOfType(option, "number", true) ||
    isConfigOptionOfType(option, "string", false) || isConfigOptionOfType(option, "string", true)) {
    validateValidOptions(option.default, option.validOptions);
  } else if (isConfigOptionOfType(option, "boolean", false) || isConfigOptionOfType(option, "boolean", true)) {
    if (option.hint !== undefined) {
      throw new TypeError("cannot provide hint for flag");
    }
    if (option.validOptions !== undefined) {
      throw new TypeError("cannot provide validOptions for flag");
    }
  }
  return option;
}

// Class and main functionality
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
    this.#configSet = {};
    this.#shorts = {};
  }

  setConfigValues(values, source = '') {
    try {
      this.validate(values);
    } catch (er) {
      if (source && er instanceof Error) {
        /* c8 ignore next */
        const cause = typeof er.cause === 'object' ? er.cause : {};
        er.cause = { ...cause, path: source };
      }
      throw er;
    }

    for (const [field, value] of Object.entries(values)) {
      const my = this.#configSet[field];
      /* c8 ignore start */
      if (!my) {
        throw new Error('unexpected field in config set: ' + field, {
          cause: { found: field },
        });
      }
      /* c8 ignore stop */
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
        //@ts-ignore
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
      tokens: true,
    });
    const p = { values: {}, positionals: [] };

    for (const token of result.tokens) {
      if (token.kind === "positional") {
        p.positionals.push(token.value);
        if (this.#options.stopAtPositional || this.#options.stopAtPositionalTest?.(token.value)) {
          p.positionals.push(...args.slice(token.index + 1));
          break;
        }
      } else if (token.kind === 'option') {
        let value = undefined;
        const my = this.#configSet[token.name];
        if (!my) {
          throw new Error(`Unknown option '${token.rawName}'. ` +
            `To specify a positional argument starting with a '-', ` +
            `place it at the end of the command after '--', as in ` +
            `'-- ${token.rawName}'`, { cause: { found: token.rawName + (token.value ? `=${token.value}` : '') } });
        }

        if (token.value === undefined) {
          if (my.type !== "boolean") {
            throw new Error(`No value provided for ${token.rawName}, expected ${my.type}`, {
              cause: { name: token.rawName, wanted: valueType(my) }
            });
          }
          value = true;
        } else {
          if (my.type === "boolean") {
            throw new Error(`Flag ${token.rawName} does not take a value, received '${token.value}'`, { cause: { found: token } });
          }
          if (my.type === "string") {
            value = token.value;
          } else {
            value = +token.value;
            if (isNaN(value)) {
              throw new Error(`Invalid value '${token.value}' provided for ` +
                `'${token.rawName}' option, expected number`, {
                cause: { name: token.rawName, found: token.value, wanted: 'number' }
              });
            }
          }
        }

        if (my.multiple) {
          (p.values[token.name] = p.values[token.name] || []).push(value);
        } else {
          p.values[token.name] = value;
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

  validate(o) {
    if (!o || typeof o !== 'object') {
      throw new Error('Invalid config: not an object', { cause: { found: o } });
    }
    const opts = o;
    for (const field in o) {
      const value = opts[field];
      /* c8 ignore next - for TS */
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
        : config.validate && !config.validate(value) ?
        { name: field, found: value }
        : undefined;
      if (cause) {
        throw new Error(`Invalid config value for ${field}: ${value}`, { cause });
      }
    }
  }

  writeEnv(p) {
    if (!this.#env || !this.#envPrefix) return;
    for (const [field, value] of Object.entries(p.values)) {
      const my = this.#configSet[field];
      this.#env[toEnvKey(this.#envPrefix, field)] = toEnvVal(value, my?.delim);
    }
  }

  // Various field addition methods
  addFields(fields) {
    return this.#addFields(this, fields);
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

  usage() {
    if (this.#usage) return this.#usage;
    const ui = cliui({ width: Math.min(process?.stdout?.columns ?? 80, 80) });
    const first = this.#fields[0];
    const cmd = String(process.argv[1]);
    
    if (first?.type === 'heading') {
      ui.div({ padding: [0, 0, 0, 0], text: normalize(first.text) });
    }

    ui.div({ padding: [0, 0, 0, 0], text: 'Usage:' });

    if (this.#options.usage) {
      ui.div({ text: this.#options.usage, padding: [0, 0, 0, 2] });
    } else {
      const cmdBase = basename(cmd);
      ui.div({ text: `${cmdBase} usage instructions here`, padding: [0, 0, 0, 2] });
    }

    ui.div({ padding: [0, 0, 0, 0], text: '' });

    return this.#usage = ui.toString();
  }

  usageMarkdown() {
    if (this.#usageMarkdown) return this.#usageMarkdown;
    const cmd = String(process.argv[1]);
    const first = this.#fields[0];
    const usageText = first?.type === 'heading' ? `# ${normalize(first.text)}` : '';

    const out = [`Usage:`, usageText, `${basename(cmd)} usage instructions here`];

    return this.#usageMarkdown = out.join('\n\n') + '\n';
  }

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
  
  [inspect.custom](_, options) {
    return `Jack ${inspect(this.toJSON(), options)}`;
  }
}

// Main export
const jack = (options = {}) => new Jack(options);
module.exports = { jack, Jack, isConfigOption, isConfigOptionOfType, isConfigType };

// Normalize strings
function normalize(s, pre = false) {
  if (pre) return s.split('\n').map(l => `\u200b${l}`).join('\n');
  return s.split(/^\s*
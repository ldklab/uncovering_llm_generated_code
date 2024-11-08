'use strict';

const util = require('util');
const fs = require('fs');
const path = require('path');

function camelCase(str) {
    return str.toLocaleLowerCase().replace(/[-_]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '');
}

function decamelize(str, joinString = '-') {
    return str.replace(/[A-Z]/g, (chr, index) => (index ? joinString : '') + chr.toLowerCase());
}

function looksLikeNumber(x) {
    if (x == null) return false;
    if (typeof x === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(x)) return true;
    if (x.length > 1 && x[0] === '0') return false;
    return /^-?\d+(\.\d+)?([eE][-+]?\d+)?$/.test(x);
}

function tokenizeArgString(argString) {
    if (Array.isArray(argString)) {
        return argString.map(e => e.toString());
    }
    argString = argString.trim();
    let args = [], currentArg = '', opening = null;
    for (let i = 0; i < argString.length; i++) {
        const char = argString[i];
        if (char === ' ' && !opening) {
            if (currentArg) args.push(currentArg);
            currentArg = '';
        } else {
            if (!opening && (char === '"' || char === '\'')) {
                opening = char;
            } else if (char === opening) {
                opening = null;
            }
            currentArg += char;
        }
    }
    if (currentArg) args.push(currentArg);
    return args;
}

let mixin;
class YargsParser {
    constructor(_mixin) {
        mixin = _mixin;
    }

    parse(argsInput, options) {
        const defaultOpts = {
            alias: undefined,
            array: undefined,
            boolean: undefined,
            config: undefined,
            configObjects: undefined,
            configuration: undefined,
            coerce: undefined,
            count: undefined,
            default: undefined,
            envPrefix: undefined,
            narg: undefined,
            normalize: undefined,
            string: undefined,
            number: undefined,
            __: undefined,
            key: undefined
        };
        const opts = { ...defaultOpts, ...options };
        const args = tokenizeArgString(argsInput);
        const aliases = combineAliases({ ...opts.alias });
        const configuration = {
            'boolean-negation': true,
            'camel-case-expansion': true,
            'combine-arrays': false,
            'dot-notation': true,
            'duplicate-arguments-array': true,
            'flatten-duplicate-arrays': true,
            'greedy-arrays': true,
            'halt-at-non-option': false,
            'nargs-eats-options': false,
            'negation-prefix': 'no-',
            'parse-numbers': true,
            'parse-positional-numbers': true,
            'populate--': false,
            'set-placeholder-key': false,
            'short-option-groups': true,
            'strip-aliased': false,
            'strip-dashed': false,
            'unknown-options-as-args': false,
            ...opts.configuration
        };
        const defaults = { ...opts.default };
        const configObjects = opts.configObjects || [];
        const envPrefix = opts.envPrefix;
        const notFlagsOption = configuration['populate--'];
        const notFlagsArgv = notFlagsOption ? '--' : '_';
        const newAliases = Object.create(null);
        const defaulted = Object.create(null);
        const __ = opts.__ || mixin.format;
        const flags = {
          aliases: Object.create(null),
          arrays: Object.create(null),
          bools: Object.create(null),
          strings: Object.create(null),
          numbers: Object.create(null),
          counts: Object.create(null),
          normalize: Object.create(null),
          configs: Object.create(null),
          nargs: Object.create(null),
          coercions: Object.create(null),
          keys: []
        };
        const negative = /^-([0-9]+(\.[0-9]+)?|\.[0-9]+)$/;
        const negatedBoolean = new RegExp('^--' + configuration['negation-prefix'] + '(.+)');

        [opts.array, opts.boolean, opts.string, opts.number, opts.count, opts.normalize].forEach((typeGroup, index) => {
            const flagTargetKeys = ['arrays', 'bools', 'strings', 'numbers', 'counts', 'normalize'][index];
            (Array.isArray(typeGroup) ? typeGroup : [typeGroup]).filter(Boolean).forEach(key => {
                flags[flagTargetKeys][key] = true;
                flags.keys.push(key);
            });
        });

        ['narg', 'coerce'].forEach((optionName) => {
            if (typeof opts[optionName] === 'object') {
                Object.entries(opts[optionName]).forEach(([key, value]) => {
                    if (optionName === 'narg' ? typeof value === 'number' : typeof value === 'function') {
                        flags[optionName + 's'][key] = value;
                        flags.keys.push(key);
                    }
                });
            }
        });

        if (opts.config) {
            const configOpts = Array.isArray(opts.config) || typeof opts.config === 'string' ? [opts.config] : Object.entries(opts.config);
            configOpts.filter(Boolean).forEach(config => {
                const [key, value] = typeof config === 'object' ? config : [config, true];
                flags.configs[key] = value;
            });
        }

        extendAliases(opts.key, aliases, opts.default, flags.arrays);
        Object.keys(defaults).forEach(key => (
            (flags.aliases[key] || []).forEach(alias => defaults[alias] = defaults[key])
        ));

        let error = null;
        checkConfiguration();
        let notFlags = [];
        const argv = { _: [] };
        const argvReturn = {};

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            let m, key, next;

            if (arg !== '--' && isUnknownOptionAsArg(arg)) {
                pushPositional(arg);
            } else if (arg.match(/^--.+=/) || (!configuration['short-option-groups'] && arg.match(/^-.+=/))) {
                m = arg.match(/^--?([^=]+)=([\s\S]*)$/);
                if (m) {
                    checkAllAliases(m[1], flags.arrays) ? i = eatArray(i, m[1], args, m[2])
                        : checkAllAliases(m[1], flags.nargs) !== false ? i = eatNargs(i, m[1], args, m[2])
                        : setArg(m[1], m[2]);
                }
            } else if (arg.match(negatedBoolean) && configuration['boolean-negation']) {
                m = arg.match(negatedBoolean);
                if (m) {
                    key = m[1];
                    setArg(key, checkAllAliases(key, flags.arrays) ? [false] : false);
                }
            } else if (arg.match(/^--.+/) || (!configuration['short-option-groups'] && arg.match(/^-[^-]+/))) {
                m = arg.match(/^--?(.+)/);
                if (m) {
                    key = m[1];
                    if (checkAllAliases(key, flags.arrays)) {
                        i = eatArray(i, key, args);
                    } else if (checkAllAliases(key, flags.nargs) !== false) {
                        i = eatNargs(i, key, args);
                    } else {
                        next = args[i + 1];
                        const canSetArgByDefault = next === undefined || !next.match(/^-/) || next.match(negative);
                        const canSetArgDirectly = !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts);
                        if (canSetArgByDefault && canSetArgDirectly) {
                            setArg(key, next);
                            i++;
                        } else if (['true', 'false'].includes(next)) {
                            setArg(key, next);
                            i++;
                        } else {
                            setArg(key, defaultValue(key));
                        }
                    }
                }
            } else if (arg.match(/^-.\..+=/)) {
                m = arg.match(/^-([^=]+)=([\s\S]*)$/);
                if (m) setArg(m[1], m[2]);
            } else if (arg.match(/^-.\..+/) && !arg.match(negative)) {
                next = args[i + 1];
                m = arg.match(/^-(.\..+)/);
                if (m) {
                    key = m[1];
                    if (next !== undefined && !next.match(/^-/) &&
                        !checkAllAliases(key, flags.bools) &&
                        !checkAllAliases(key, flags.counts)) {
                        setArg(key, next);
                        i++;
                    }
                    else {
                        setArg(key, defaultValue(key));
                    }
                }
            } else if (arg.match(/^-[^-]+/) && !arg.match(negative)) {
                const letters = arg.slice(1, -1).split('');
                let broken = false;
                for (let j = 0; j < letters.length; j++) {
                    next = arg.slice(j + 2);
                    if (letters[j + 1] && letters[j + 1] === '=') {
                        const value = arg.slice(j + 3);
                        key = letters[j];
                        if (checkAllAliases(key, flags.arrays)) {
                            i = eatArray(i, key, args, value);
                        } else if (checkAllAliases(key, flags.nargs) !== false) {
                            i = eatNargs(i, key, args, value);
                        } else {
                            setArg(key, value);
                        }
                        broken = true;
                        break;
                    }
                    if (next === '-') {
                        setArg(letters[j], next);
                        continue;
                    }
                    if (/[A-Za-z]/.test(letters[j]) &&
                        /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next) &&
                        !checkAllAliases(next, flags.bools)) {
                        setArg(letters[j], next);
                        broken = true;
                        break;
                    }
                    if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                        setArg(letters[j], next);
                        broken = true;
                        break;
                    } else {
                        setArg(letters[j], defaultValue(letters[j]));
                    }
                }
                key = arg[arg.length-1];
                if (!broken && key !== '-') {
                    if (checkAllAliases(key, flags.arrays)) {
                        i = eatArray(i, key, args);
                    } else if (checkAllAliases(key, flags.nargs) !== false) {
                        i = eatNargs(i, key, args);
                    } else {
                        next = args[i + 1];
                        const canSetArgByDefault = next === undefined || !next.match(/^-/) || next.match(negative);
                        const canSetArgDirectly = !checkAllAliases(key, flags.bools) && !checkAllAliases(key, flags.counts);
                        if (canSetArgByDefault && canSetArgDirectly) {
                            setArg(key, next);
                            i++;
                        } else if (['true', 'false'].includes(next)) {
                            setArg(key, next);
                            i++;
                        } else {
                            setArg(key, defaultValue(key));
                        }
                    }
                }
            } else if (arg.match(/^-[0-9]$/) &&
                arg.match(negative) &&
                checkAllAliases(arg.slice(1), flags.bools)) {
                key = arg.slice(1);
                setArg(key, defaultValue(key));
            } else if (arg === '--') {
                notFlags = args.slice(i + 1);
                break;
            } else if (configuration['halt-at-non-option']) {
                notFlags = args.slice(i);
                break;
            } else {
                pushPositional(arg);
            }
        }

        applyEnvVars(argv, true);
        applyEnvVars(argv, false);
        setConfig(argv);
        setConfigObjects();
        applyDefaultsAndAliases(argv, flags.aliases, defaults, true);
        applyCoercions(argv);
        if (configuration['set-placeholder-key']) setPlaceholderKeys(argv);

        Object.keys(flags.counts).forEach(key => {
            if (!hasKey(argv, key.split('.'))) setArg(key, 0);
        });

        if (notFlagsOption && notFlags.length) argv[notFlagsArgv] = [];
        notFlags.forEach(key => {
            argv[notFlagsArgv].push(key);
        });

        if (configuration['camel-case-expansion'] && configuration['strip-dashed']) {
            Object.keys(argv).filter(key => key !== '--' && key.includes('-')).forEach(key => {
                delete argv[key];
            });
        }

        if (configuration['strip-aliased']) {
            Object.values(aliases).flat().forEach(alias => {
                if (configuration['camel-case-expansion'] && alias.includes('-')) {
                    delete argv[alias.split('.').map(camelCase).join('.')];
                }
                delete argv[alias];
            });
        }
        
        function pushPositional(arg) {
            const coerced = maybeCoerceNumber('_', arg);
            if (typeof coerced === 'string' || typeof coerced === 'number') {
                argv._.push(coerced);
            }
        }

        function eatNargs(i, key, args, argAfterEqualSign) {
            let toEat = checkAllAliases(key, flags.nargs) || 1;
            let available = isUndefined(argAfterEqualSign) ? 0 : 1;
            if (configuration['nargs-eats-options']) {
                if (args.length - (i + 1) + available < toEat) {
                    error = Error(__('Not enough arguments following: %s', key));
                }
                available = toEat;
            } else {
                for (let ii = i + 1; ii < args.length; ii++) {
                    if (!args[ii].match(/^-[^0-9]/) || args[ii].match(negative) || isUnknownOptionAsArg(args[ii]))
                        available++;
                    else
                        break;
                }
                if (available < toEat)
                    error = Error(__('Not enough arguments following: %s', key));
            }
            let consumed = Math.min(available, toEat);
            if (!isUndefined(argAfterEqualSign) && consumed > 0) {
                setArg(key, argAfterEqualSign);
                consumed--;
            }

            for (let ii = i + 1; ii < (consumed + i + 1); ii++) {
                setArg(key, args[ii]);
            }
            return (i + consumed);
        }

        function eatArray(i, key, args, argAfterEqualSign) {
            let argsToSet = [];
            let next = argAfterEqualSign || args[i + 1];
            const nargsCount = checkAllAliases(key, flags.nargs);
            if (checkAllAliases(key, flags.bools) && !(/^(true|false)$/.test(next))) {
                argsToSet.push(true);
            } else if (isUndefined(next) ||
                (isUndefined(argAfterEqualSign) && /^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next))) {
                if (defaults[key] !== undefined) {
                    argsToSet = Array.isArray(defaults[key]) ? defaults[key] : [defaults[key]];
                }
            } else {
                if (!isUndefined(argAfterEqualSign)) {
                    argsToSet.push(processValue(key, argAfterEqualSign));
                }
                for (let ii = i + 1; ii < args.length; ii++) {
                    if ((!configuration['greedy-arrays'] && argsToSet.length) ||
                        (nargsCount && argsToSet.length >= nargsCount)) break;
                    next = args[ii];
                    if (/^-/.test(next) && !negative.test(next) && !isUnknownOptionAsArg(next)) break;
                    i = ii;
                    argsToSet.push(processValue(key, next));
                }
            }

            if (typeof nargsCount === 'number' && ((nargsCount && argsToSet.length < nargsCount) ||
                (isNaN(nargsCount) && argsToSet.length === 0))) {
                error = Error(__('Not enough arguments following: %s', key));
            }
            setArg(key, argsToSet);
            return i;
        }

        function setArg(key, val) {
            if (/-/.test(key) && configuration['camel-case-expansion']) {
                const alias = key.split('.').map(camelCase).join('.');
                addNewAlias(key, alias);
            }
            const value = processValue(key, val);
            const splitKey = key.split('.');
            setKey(argv, splitKey, value);
            if (flags.aliases[key]) {
                flags.aliases[key].forEach(x => setKey(argv, x.split('.'), value));
            }
            if (splitKey.length > 1 && configuration['dot-notation']) {
                (flags.aliases[splitKey[0]] || []).forEach(x => {
                    let keyProperties = x.split('.');
                    const a = splitKey.slice(1);
                    keyProperties = keyProperties.concat(a);
                    if (!(flags.aliases[key] || []).includes(keyProperties.join('.'))) {
                        setKey(argv, keyProperties, value);
                    }
                });
            }
            if (checkAllAliases(key, flags.normalize) && !checkAllAliases(key, flags.arrays)) {
                const keys = [key, ...(flags.aliases[key] || [])];
                keys.forEach(k => {
                    Object.defineProperty(argvReturn, k, {
                        enumerable: true,
                        get: () => val,
                        set: v => { val = typeof v === 'string' ? mixin.normalize(v) : v; }
                    });
                });
            }
        }

        function addNewAlias(key, alias) {
            if (!(flags.aliases[key] && flags.aliases[key].length)) {
                flags.aliases[key] = [alias];
                newAliases[alias] = true;
            }
            if (!(flags.aliases[alias] && flags.aliases[alias].length)) {
                addNewAlias(alias, key);
            }
        }

        function processValue(key, val) {
            if (typeof val === 'string' && (val[0] === "'" || val[0] === '"') && val[val.length - 1] === val[0]) {
                val = val.slice(1, -1);
            }
            if (checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts)) {
                if (typeof val === 'string') val = val === 'true';
            }
            let value = Array.isArray(val)
                ? val.map(v => maybeCoerceNumber(key, v))
                : maybeCoerceNumber(key, val);
            if (checkAllAliases(key, flags.counts) && (isUndefined(value) || typeof value === 'boolean')) {
                value = increment();
            }
            if (checkAllAliases(key, flags.normalize) && checkAllAliases(key, flags.arrays)) {
                value = Array.isArray(val) ? val.map(mixin.normalize) : mixin.normalize(val);
            }
            return value;
        }

        function maybeCoerceNumber(key, value) {
            if (!configuration['parse-positional-numbers'] && key === '_') return value;
            if (!checkAllAliases(key, flags.strings) && !checkAllAliases(key, flags.bools) && !Array.isArray(value)) {
                const shouldCoerceNumber = looksLikeNumber(value) &&
                    configuration['parse-numbers'] &&
                    Number.isSafeInteger(Math.floor(parseFloat(value)));
                if (shouldCoerceNumber || (!isUndefined(value) && checkAllAliases(key, flags.numbers))) {
                    value = Number(value);
                }
            }
            return value;
        }

        function setConfig(argv) {
            const configLookup = {};
            applyDefaultsAndAliases(configLookup, flags.aliases, defaults);
            Object.keys(flags.configs).forEach(configKey => {
                const configPath = argv[configKey] || configLookup[configKey];
                if (configPath) {
                    try {
                        const resolvedConfigPath = mixin.resolve(mixin.cwd(), configPath);
                        const resolveConfig = flags.configs[configKey];
                        const config = typeof resolveConfig === 'function'
                            ? resolveConfig(resolvedConfigPath)
                            : mixin.require(resolvedConfigPath);
                        if (config instanceof Error) {
                            error = config;
                            return;
                        }
                        setConfigObject(config);
                    } catch (ex) {
                        error = ex.name === 'PermissionDenied' ? ex : Error(__('Invalid JSON config file: %s', configPath));
                    }
                }
            });
        }

        function setConfigObject(config, prev) {
            Object.entries(config).forEach(([key, value]) => {
                const fullKey = prev ? `${prev}.${key}` : key;
                if (typeof value === 'object' && !Array.isArray(value) && value !== null && configuration['dot-notation']) {
                    setConfigObject(value, fullKey);
                } else {
                    if (!hasKey(argv, fullKey.split('.')) || (checkAllAliases(fullKey, flags.arrays) && configuration['combine-arrays'])) {
                        setArg(fullKey, value);
                    }
                }
            });
        }

        function setConfigObjects() {
            if (configObjects) {
                configObjects.forEach(configObject => setConfigObject(configObject));
            }
        }

        function applyEnvVars(argv, configOnly) {
            if (envPrefix === undefined) return;
            const prefix = typeof envPrefix === 'string' ? envPrefix : '';
            const env = mixin.env();
            Object.entries(env).forEach(([envVar, envValue]) => {
                if (!prefix || envVar.startsWith(prefix)) {
                    const keys = envVar.split('__').map((key, i) => i === 0 ? camelCase(key.replace(prefix, '')) : camelCase(key));
                    if (((configOnly && flags.configs[keys.join('.')]) || !configOnly) && !hasKey(argv, keys)) {
                        setArg(keys.join('.'), envValue);
                    }
                }
            });
        }

        function applyCoercions(argv) {
            const applied = new Set();
            Object.keys(argv).forEach(key => {
                if (!applied.has(key)) {
                    const coerce = checkAllAliases(key, flags.coercions);
                    if (typeof coerce === 'function') {
                        try {
                            const value = maybeCoerceNumber(key, coerce(argv[key]));
                            [].concat(flags.aliases[key] || [], key).forEach(ali => {
                                applied.add(ali);
                                argv[ali] = value;
                            });
                        } catch (err) {
                            error = err;
                        }
                    }
                }
            });
        }

        function setPlaceholderKeys(argv) {
            flags.keys.forEach(key => {
                if (!key.includes('.')) {
                    if (argv[key] === undefined) argv[key] = undefined;
                }
            });
            return argv;
        }

        function applyDefaultsAndAliases(obj, aliases, defaults, canLog = false) {
            Object.keys(defaults).forEach(key => {
                if (!hasKey(obj, key.split('.'))) {
                    setKey(obj, key.split('.'), defaults[key]);
                    if (canLog) defaulted[key] = true;
                    (aliases[key] || []).forEach(x => {
                        if (!hasKey(obj, x.split('.'))) setKey(obj, x.split('.'), defaults[key]);
                    });
                }
            });
        }

        function hasKey(obj, keys) {
            return keys.reduce((prev, key) => prev && prev[key], obj) !== undefined;
        }

        function setKey(obj, keys, value) {
            keys.slice(0, -1).reduce((subObj, key) => subObj[key] || (subObj[key] = {}), obj)[keys[keys.length - 1]] = value;
        }

        function extendAliases(...args) {
            args.forEach(obj => {
                Object.keys(obj || {}).forEach(key => {
                    flags.aliases[key] = (flags.aliases[key] || []).concat(aliases[key] || [], key);
                    (flags.aliases[key] || []).forEach(alias => {
                        flags.aliases[alias] = [key, ...flags.aliases[key].filter(y => alias !== y)];
                    });
                });
            });
        }

        function checkAllAliases(key, flag) {
            return [].concat(flags.aliases[key] || [], key).find(k => flag[k]) || false;
        }

        function hasAnyFlag(key) {
            return Object.values(flags).some(flag => Array.isArray(flag) ? flag.includes(key) : flag[key]);
        }

        function hasFlagsMatching(arg, ...patterns) {
            return patterns.flat().some(pattern => {
                const match = arg.match(pattern);
                return match && hasAnyFlag(match[1]);
            });
        }

        function hasAllShortFlags(arg) {
            if (arg.match(negative) || !arg.match(/^-[^-]+/)) return false;
            const letters = arg.slice(1).split('');
            return letters.every((letter, j) => {
                const next = arg.slice(j + 2);
                const hasPseudoValue = next === '-' || (/[A-Za-z]/.test(letter) && /^-?\d+(\.\d*)?(e-?\d+)?$/.test(next));
                return hasAnyFlag(letter) && !(letters[j + 1] && letters[j + 1].match(/\W/)) && !hasPseudoValue;
            });
        }

        function isUnknownOptionAsArg(arg) {
            return configuration['unknown-options-as-args'] && isUnknownOption(arg);
        }

        function isUnknownOption(arg) {
            if (arg.match(negative)) return false;
            return !(hasAllShortFlags(arg) || hasFlagsMatching(arg, /^-+([^=]+?)=[\s\S]*$/, negatedBoolean, /^-+([^=]+?)$/, /^-+([^=]+?)-$/, /^-+([^=]+?\d+)$/, /^-+([^=]+?)\W+.*$/));
        }

        function defaultValue(key) {
            return checkAllAliases(key, flags.bools) || checkAllAliases(key, flags.counts) || `${key}` in defaults ? defaults[key] : defaultForType(guessType(key));
        }

        function defaultForType(type) {
            const defaultValues = { boolean: true, string: '', array: [], number: undefined };
            return defaultValues[type];
        }

        function guessType(key) {
            if (checkAllAliases(key, flags.strings)) return 'string';
            if (checkAllAliases(key, flags.numbers)) return 'number';
            if (checkAllAliases(key, flags.bools)) return 'boolean';
            if (checkAllAliases(key, flags.arrays)) return 'array';
            return 'boolean';
        }

        function isUndefined(num) {
            return num === undefined;
        }

        function checkConfiguration() {
            Object.keys(flags.counts).find(key => {
                if (checkAllAliases(key, flags.arrays)) {
                    error = Error(__('Invalid configuration: %s, opts.count excludes opts.array.', key));
                    return true;
                } else if (checkAllAliases(key, flags.nargs)) {
                    error = Error(__('Invalid configuration: %s, opts.count excludes opts.narg.', key));
                    return true;
                }
                return false;
            });
        }

        return {
            aliases: { ...flags.aliases },
            argv: { ...argvReturn, ...argv },
            configuration,
            defaulted: { ...defaulted },
            error,
            newAliases: { ...newAliases }
        };
    }
}

function combineAliases(aliases) {
    let aliasArrays = Object.entries(aliases).map(([key, values]) => [key, ...values]);
    let change = true;
    while (change) {
        change = false;
        aliasArrays = aliasArrays.reduce((result, current, i) => {
            const merged = result.find(other => current.some(v => other.includes(v)));
            if (merged) {
                merged.push(...current);
                change = true;
            } else {
                result.push(current);
            }
            return result;
        }, []);
    }
    return aliasArrays.reduce((result, current) => {
        current = Array.from(new Set(current));
        if (current.length > 1) {
            result[current.pop()] = current;
        }
        return result;
    }, {});
}

function increment(orig) {
    return orig !== undefined ? orig + 1 : 1;
}

function sanitizeKey(key) {
    return key === '__proto__' ? '___proto___' : key;
}

const minNodeVersion = Number(process?.env?.YARGS_MIN_NODE_VERSION || 10);
if (process?.version) {
    const major = parseInt(process.version.match(/v(\d+)/)[1], 10);
    if (major < minNodeVersion) {
        throw Error(`yargs parser supports a minimum Node.js version of ${minNodeVersion}. Read our version support policy: https://github.com/yargs/yargs-parser#supported-nodejs-versions`);
    }
}

const env = process?.env || {};
const parser = new YargsParser({
    cwd: process.cwd,
    env: () => env,
    format: util.format,
    normalize: path.normalize,
    resolve: path.resolve,
    require: (path) => {
        if (require) {
            return require(path);
        } else if (path.endsWith('.json')) {
            return fs.readFileSync(path, 'utf8');
        } else {
            throw Error('only .json config files are supported in ESM');
        }
    }
});

const yargsParser = (args, opts) => parser.parse(args.slice(), opts).argv;
yargsParser.detailed = (args, opts) => parser.parse(args.slice(), opts);
yargsParser.camelCase = camelCase;
yargsParser.decamelize = decamelize;
yargsParser.looksLikeNumber = looksLikeNumber;

module.exports = yargsParser;

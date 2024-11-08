// Enhanced argument parsing utility in Node.js

function parseArgs(args, opts = {}) {
    const result = { _: [] };
    const booleanOpts = new Set([].concat(opts.boolean || []));
    const stringOpts = new Set([].concat(opts.string || []));
    const alias = opts.alias || {};
    const defaults = opts.default || {};
    const unknownFn = typeof opts.unknown === 'function' ? opts.unknown : undefined;

    let stopEarly = opts.stopEarly || false;
    let foundDashDash = false;
    let dashDashArgs = [];

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];

        if (arg === '--') {
            foundDashDash = true;
            dashDashArgs = args.slice(i + 1);
            break;
        }

        if (stopEarly && result._.length && !arg.startsWith('-')) {
            result._.push(...args.slice(i));
            break;
        }

        if (arg.startsWith('--')) {
            const [fullKey, value] = arg.substring(2).split('=');
            const isBoolean = booleanOpts.has(fullKey);
            const isString = stringOpts.has(fullKey);
            const parsedValue = parseValue(value, isBoolean, isString);

            addParsedArg(result, fullKey, parsedValue, alias, unknownFn);
        } else if (arg.startsWith('-')) {
            processShortArg(arg.slice(1), result, alias, booleanOpts);
        } else {
            result._.push(arg);
        }
    }

    handleDashDash(foundDashDash, dashDashArgs, result, opts);
    applyDefaults(result, defaults, alias);

    return result;
}

function parseValue(value, isBoolean, isString) {
    if (value !== undefined) {
        if (isBoolean) return isTruthy(value);
        if (isString) return String(value);
        return isNaN(value) ? value : Number(value);
    }
    return true;
}

function addParsedArg(result, key, value, alias, unknownFn) {
    if (unknownFn && !isKnownOption(key, result, alias) && unknownFn(`--${key}`) === false) {
        return;
    }
    
    setArgumentValue(result, key, value);
    (alias[key] || []).forEach(aKey => setArgumentValue(result, aKey, value));
}

function processShortArg(argPart, result, alias, booleanOpts) {
    const [flags, nextArg] = splitFlagsAndValue(argPart, booleanOpts);

    flags.forEach(flag => {
        const value = nextArg !== null || !booleanOpts.has(flag) ? nextArg || true : true;
        addParsedArg(result, flag, value, alias);
    });

    if (nextArg != null && !flags.length) {
        result._.push(nextArg);
    }
}

function splitFlagsAndValue(argPart, booleanOpts) {
    const flags = [];
    let nextArg = null;

    for (let i = 0; i < argPart.length; i++) {
        if (argPart[i] === '=' || (!isNaN(argPart[i]) && !booleanOpts.has(argPart[i]))) {
            nextArg = argPart.slice(i);
            break;
        }
        flags.push(argPart[i]);
    }

    return [flags, nextArg];
}

function handleDashDash(foundDashDash, dashDashArgs, result, opts) {
    if (foundDashDash) {
        if (opts['--']) {
            result['--'] = dashDashArgs;
        } else {
            result._.push('--', ...dashDashArgs);
        }
    }
}

function applyDefaults(result, defaults, alias) {
    for (const key of Object.keys(defaults)) {
        if (result[key] !== undefined) continue;
        setArgumentValue(result, key, defaults[key]);
        (alias[key] || []).forEach(aKey => {
            if (result[aKey] === undefined) result[aKey] = defaults[key];
        });
    }
}

function setArgumentValue(result, key, value) {
    if (result[key] !== undefined && typeof result[key] !== typeof value) {
        if (Array.isArray(result[key])) {
            result[key].push(value);
        } else {
            result[key] = [result[key], value];
        }
    } else {
        result[key] = value;
    }
}

function isTruthy(value) {
    return value === 'true' || value === '1';
}

function isKnownOption(key, result, alias) {
    return result.hasOwnProperty(key) || alias[key] !== undefined;
}

module.exports = parseArgs;

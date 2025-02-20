// minimist/index.js

function parseArgs(args, opts = {}) {
    const result = { _: [] };
    const booleanOpts = new Set(opts.boolean ? [].concat(opts.boolean) : []);
    const stringOpts = new Set(opts.string ? [].concat(opts.string) : []);
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
            let [key, value] = arg.split('=');
            key = key.slice(2);

            if (booleanOpts.has(key)) {
                value = value ? isTruthy(value) : true;
            } else if (stringOpts.has(key)) {
                value = value ? String(value) : '';
            } else if (value !== undefined) {
                value = isNaN(value) ? value : Number(value);
            } else {
                value = true;
            }

            addArgument(result, key, value, alias);
        } else if (arg.startsWith('-')) {
            let letters = arg.slice(1).split('');
            let numOrEnd = letters.findIndex(l => l === '=' || !isNaN(l)), nextArg = null;

            if (numOrEnd !== -1) {
                nextArg = arg.slice(numOrEnd + 1);
                letters = letters.slice(0, numOrEnd);
            }

            for (let letter of letters) {
                let value = (nextArg == null ? !booleanOpts.has(letter) : nextArg);

                if (!value && nextArg !== null) value = true;
                if (!value && nextArg == null && booleanOpts.has(letter)) value = true;

                addArgument(result, letter, value, alias);
                nextArg = null;
            }

            if (nextArg != null) {
                result._.push(nextArg);
            }
        } else {
            result._.push(arg);
        }
    }

    if (foundDashDash) {
        if (opts['--']) {
            result['--'] = dashDashArgs;
        } else {
            result._.push('--', ...dashDashArgs);
        }
    }

    applyDefaults(result, defaults, alias);

    return result;
}

function addArgument(result, key, value, alias) {
    if (unknownFn && !knownOption(key, result, alias)) {
        if (unknownFn(`--${key}`) === false) {
            return;
        }
    }

    setArgValue(result, key, value);
    if (alias[key]) {
        alias[key].forEach(aKey => setArgValue(result, aKey, value));
    }
}

function knownOption(key, result, alias) {
    return result.hasOwnProperty(key) || alias[key] != undefined;
}

function setArgValue(result, key, value) {
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

function applyDefaults(result, defaults, alias) {
    Object.keys(defaults).forEach(key => {
        if (result[key] === undefined) {
            result[key] = defaults[key];
        }
        if (alias[key]) {
            alias[key].forEach(aKey => {
                if (result[aKey] === undefined) {
                    result[aKey] = defaults[key];
                }
            });
        }
    });
}

function isTruthy(value) {
    return value === 'true' || value === '1';
}

module.exports = parseArgs;

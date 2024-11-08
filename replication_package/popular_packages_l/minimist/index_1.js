function parseArgs(args, options = {}) {
    const parsedArgs = { _: [] };
    const booleanOptions = new Set(options.boolean ? [].concat(options.boolean) : []);
    const stringOptions = new Set(options.string ? [].concat(options.string) : []);
    const aliasMap = options.alias || {};
    const defaultValues = options.default || {};
    const unknownHandler = typeof options.unknown === 'function' ? options.unknown : undefined;

    let stopParsingEarly = options.stopEarly || false;
    let hasDashDash = false;
    let remainingArgs = [];

    for (let i = 0; i < args.length; i++) {
        let currentArg = args[i];

        if (currentArg === '--') {
            hasDashDash = true;
            remainingArgs = args.slice(i + 1);
            break;
        }

        if (stopParsingEarly && parsedArgs._.length && !currentArg.startsWith('-')) {
            parsedArgs._.push(...args.slice(i));
            break;
        }

        if (currentArg.startsWith('--')) {
            let [key, val] = currentArg.split('=');
            key = key.slice(2);

            if (booleanOptions.has(key)) {
                val = val ? toBoolean(val) : true;
            } else if (stringOptions.has(key)) {
                val = val ? String(val) : '';
            } else if (val !== undefined) {
                val = isNaN(val) ? val : Number(val);
            } else {
                val = true;
            }

            processArgument(parsedArgs, key, val, aliasMap);
        } else if (currentArg.startsWith('-')) {
            let letters = currentArg.slice(1).split('');
            let index = letters.findIndex(l => l === '=' || !isNaN(l)), nextArg = null;

            if (index !== -1) {
                nextArg = currentArg.slice(index + 1);
                letters = letters.slice(0, index);
            }

            for (let letter of letters) {
                let value = (nextArg == null ? !booleanOptions.has(letter) : nextArg);

                if (!value && nextArg !== null) value = true;
                if (!value && nextArg == null && booleanOptions.has(letter)) value = true;

                processArgument(parsedArgs, letter, value, aliasMap);
                nextArg = null;
            }

            if (nextArg != null) {
                parsedArgs._.push(nextArg);
            }
        } else {
            parsedArgs._.push(currentArg);
        }
    }

    if (hasDashDash) {
        if (options['--']) {
            parsedArgs['--'] = remainingArgs;
        } else {
            parsedArgs._.push('--', ...remainingArgs);
        }
    }

    applyDefaults(parsedArgs, defaultValues, aliasMap);

    return parsedArgs;
}

function processArgument(parsedArgs, key, value, aliasMap) {
    if (unknownHandler && !isKnownOption(key, parsedArgs, aliasMap)) {
        if (unknownHandler(`--${key}`) === false) {
            return;
        }
    }

    assignValue(parsedArgs, key, value);
    if (aliasMap[key]) {
        aliasMap[key].forEach(aliasKey => assignValue(parsedArgs, aliasKey, value));
    }
}

function isKnownOption(key, parsedArgs, aliasMap) {
    return parsedArgs.hasOwnProperty(key) || aliasMap[key] !== undefined;
}

function assignValue(parsedArgs, key, value) {
    if (parsedArgs[key] !== undefined && typeof parsedArgs[key] !== typeof value) {
        if (Array.isArray(parsedArgs[key])) {
            parsedArgs[key].push(value);
        } else {
            parsedArgs[key] = [parsedArgs[key], value];
        }
    } else {
        parsedArgs[key] = value;
    }
}

function applyDefaults(parsedArgs, defaultValues, aliasMap) {
    Object.keys(defaultValues).forEach(key => {
        if (parsedArgs[key] === undefined) {
            parsedArgs[key] = defaultValues[key];
        }
        if (aliasMap[key]) {
            aliasMap[key].forEach(aliasKey => {
                if (parsedArgs[aliasKey] === undefined) {
                    parsedArgs[aliasKey] = defaultValues[key];
                }
            });
        }
    });
}

function toBoolean(value) {
    return value === 'true' || value === '1';
}

module.exports = parseArgs;

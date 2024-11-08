module.exports = function (args, opts = {}) {
    const flags = { 
        bools: {}, 
        strings: {}, 
        unknownFn: typeof opts.unknown === 'function' ? opts.unknown : null,
        allBools: Boolean(opts.boolean === true)
    };

    const argv = { _: [] };
    const defaults = opts.default || {};
    let notFlags = [];

    initializeFlags(opts, flags);
    initializeAliases(opts.alias || {}, flags, aliases);
    initializeArgvDefaults(defaults, flags, argv);

    if (args.includes('--')) {
        notFlags = args.slice(args.indexOf('--') + 1);
        args = args.slice(0, args.indexOf('--'));
    }

    processArgs(args, flags, argv, opts);

    // Add values for undefined keys based on defaults
    setDefaultsInArgv(defaults, aliases, argv);

    if (opts['--']) {
        argv['--'] = notFlags;
    } else {
        argv._.push(...notFlags);
    }

    return argv;
};

function initializeFlags(opts, flags) {
    [].concat(opts.boolean).filter(Boolean).forEach(key => {
        flags.bools[key] = true;
    });

    [].concat(opts.string).filter(Boolean).forEach(key => {
        flags.strings[key] = true;
    });
}

function initializeAliases(aliasOptions, flags, aliases) {
    Object.keys(aliasOptions).forEach(key => {
        aliases[key] = [].concat(aliasOptions[key]);
        aliases[key].forEach(alias => {
            aliases[alias] = [key].concat(aliases[key].filter(y => alias !== y));
        });
    });
}

function initializeArgvDefaults(defaults, flags, argv) {
    Object.keys(flags.bools).forEach(key => {
        argv[key] = defaults[key] === undefined ? false : defaults[key];
    });
}

function processArgs(args, flags, argv, opts) {
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (/^--.+=/.test(arg)) {
            handleLongEquals(arg, flags, argv);
        } else if (/^--no-.+/.test(arg)) {
            setArg(arg.match(/^--no-(.+)/)[1], false, arg, flags, argv);
        } else if (/^--.+/.test(arg)) {
            i += handleLong(arg, args, i, flags, argv, opts);
        } else if (/^-[^-]+/.test(arg)) {
            i += handleShort(arg, args, i, flags, argv, opts);
        } else {
            handleUnknownArg(arg, flags, argv, opts);
        }
    }
}

function handleLongEquals(arg, flags, argv) {
    const [_, key, value] = arg.match(/^--([^=]+)=([\s\S]*)$/);
    const formattedValue = flags.bools[key] ? value !== 'false' : value;
    setArg(key, formattedValue, arg, flags, argv);
}

function handleLong(arg, args, index, flags, argv, opts) {
    const key = arg.match(/^--(.+)/)[1];
    const next = args[index + 1];

    if (isNextValueValid(next, key, flags)) {
        setArg(key, next, arg, flags, argv);
        return 1;
    } else if (/^(true|false)$/.test(next)) {
        setArg(key, next === 'true', arg, flags, argv);
        return 1;
    } else {
        setArg(key, flags.strings[key] ? '' : true, arg, flags, argv);
        return 0;
    }
}

function handleShort(arg, args, index, flags, argv, opts) {
    const letters = arg.slice(1, -1).split('');
    let broken = false;

    for (let j = 0; j < letters.length; j++) {
        const next = arg.slice(j + 2);

        if (next === '-') {
            setArg(letters[j], next, arg, flags, argv);
            continue;
        }

        if (/[A-Za-z]/.test(letters[j]) && (/=/.test(next) || /-?\d+(\.\d*)?(e-?\d+)?$/.test(next))) {
            setArg(letters[j], next.replace('=', ''), arg, flags, argv);
            broken = true;
            break;
        } else {
            setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg, flags, argv);
        }
    }

    if (!broken) {
        const lastKey = arg.slice(-1)[0];
        if (args[index + 1] && !/^(-|--)[^-]/.test(args[index + 1]) && isNextValueValid(args[index + 1], lastKey, flags)) {
            setArg(lastKey, args[index + 1], arg, flags, argv);
            return 1;
        } else if (args[index + 1] && /^(true|false)$/.test(args[index + 1])) {
            setArg(lastKey, args[index + 1] === 'true', arg, flags, argv);
            return 1;
        } else {
            setArg(lastKey, flags.strings[lastKey] ? '' : true, arg, flags, argv);
            return 0;
        }
    }
    return 0;
}

function handleUnknownArg(arg, flags, argv, opts) {
    if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push(flags.strings['_'] || !isNumber(arg) ? arg : Number(arg));
    }
    if (opts.stopEarly) {
        argv._.push(...args.slice(i + 1));
    }
}

function setArg(key, value, arg, flags, argv) {
    if (arg && flags.unknownFn && !argDefined(key, arg, flags)) {
        if (flags.unknownFn(arg) === false) return;
    }
    const formattedValue = !flags.strings[key] && isNumber(value) ? Number(value) : value;
    setKey(argv, key.split('.'), formattedValue, flags, key);
}

function setKey(obj, keys, value, flags, key) {
    let o = obj;
    for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        if (o[k] === undefined) {
            o[k] = {};
        }
        o = o[k];
    }

    const lastKey = keys[keys.length - 1];
    if (o[lastKey] === undefined || flags.bools[key] || typeof o[lastKey] === 'boolean') {
        o[lastKey] = value;
    } else if (Array.isArray(o[lastKey])) {
        o[lastKey].push(value);
    } else {
        o[lastKey] = [o[lastKey], value];
    }
}

function isNextValueValid(next, key, flags) {
    return next !== undefined && !/^-/.test(next) && !flags.bools[key] && !flags.allBools;
}

function argDefined(key, arg, flags) {
    return (flags.allBools && /^--[^=]+$/.test(arg)) || flags.strings[key] || flags.bools[key] || aliases[key];
}

function setDefaultsInArgv(defaults, aliases, argv) {
    Object.keys(defaults).forEach(key => {
        if (!hasKey(argv, key.split('.'))) {
            setKey(argv, key.split('.'), defaults[key]);
        }
    });
}

function hasKey(obj, keys) {
    keys.slice(0, -1).reduce((o, key) => (o[key] = o[key] || {}), obj);
    return (keys[keys.length - 1] in obj);
}

function isNumber(x) {
    return typeof x === 'number' || /^0x[0-9a-f]+$/i.test(x) || /^[-+]?(?:\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

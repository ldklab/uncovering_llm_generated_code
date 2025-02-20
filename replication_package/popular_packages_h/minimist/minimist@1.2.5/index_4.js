module.exports = function (args, opts = {}) {
    const flags = { bools: {}, strings: {}, unknownFn: null };
    if (typeof opts['unknown'] === 'function') flags.unknownFn = opts['unknown'];

    if (opts['boolean']) {
        [].concat(opts['boolean']).filter(Boolean).forEach(key => flags.bools[key] = true);
    }

    const aliases = buildAliases(opts.alias || {});

    [].concat(opts.string).filter(Boolean).forEach(key => {
        flags.strings[key] = true;
        if (aliases[key]) flags.strings[aliases[key]] = true;
    });

    const defaults = opts['default'] || {};
    const argv = { _: [] };
    setDefaults(flags, defaults, argv);

    let notFlags = [];
    if (args.includes('--')) {
        notFlags = args.slice(args.indexOf('--') + 1);
        args = args.slice(0, args.indexOf('--'));
    }

    args.forEach((arg, i) => {
        handleArg(arg, i, args, flags, argv, aliases);
    });

    applyDefaults(defaults, argv, aliases);
    handleNotFlags(opts, notFlags, argv);

    return argv;
};

function buildAliases(aliasOption) {
    const aliases = {};
    Object.keys(aliasOption).forEach(key => {
        aliases[key] = [].concat(aliasOption[key]);
        aliases[key].forEach(x => {
            aliases[x] = [key].concat(aliases[key].filter(y => x !== y));
        });
    });
    return aliases;
}

function setDefaults(flags, defaults, argv) {
    Object.keys(flags.bools).forEach(key => {
        argv[key] = defaults[key] !== undefined ? defaults[key] : false;
    });
}

function handleArg(arg, i, args, flags, argv, aliases) {
    if (/^--.+=/.test(arg)) {
        const [ , key, value ] = arg.match(/^--([^=]+)=([\s\S]*)$/);
        const resolvedValue = flags.bools[key] && value !== 'false';
        setArg(argv, key, resolvedValue, arg, flags, aliases);
    } else if (/^--no-.+/.test(arg)) {
        const key = arg.match(/^--no-(.+)/)[1];
        setArg(argv, key, false, arg, flags, aliases);
    } else if (/^--.+/.test(arg)) {
        parseLongFlag(arg, i, args, flags, argv, aliases);
    } else if (/^-[^-]+/.test(arg)) {
        parseShortFlags(arg, i, args, flags, argv, aliases);
    } else {
        if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
            argv._.push(flags.strings['_'] || !isNumber(arg) ? arg : Number(arg));
        }
    }
}

function parseLongFlag(arg, i, args, flags, argv, aliases) {
    const key = arg.match(/^--(.+)/)[1];
    const next = args[i + 1];
    if (next !== undefined && !/^-/.test(next) && !flags.bools[key] &&
        !aliases[key]) {
        setArg(argv, key, next, arg, flags, aliases);
    } else if (/^(true|false)$/.test(next)) {
        setArg(argv, key, next === 'true', arg, flags, aliases);
    } else {
        setArg(argv, key, '', arg, flags, aliases);
    }
}

function parseShortFlags(arg, i, args, flags, argv, aliases) {
    const letters = arg.slice(1, -1).split('');
    let broken = false;
    for (let j = 0; j < letters.length; j++) {
        const next = arg.slice(j + 2);
        if (setShortFlagValue(letters, j, next, arg, i, args, flags, argv, aliases)) {
            broken = true;
            break;
        }
    }
    if (!broken) {
        const key = arg.slice(-1)[0];
        const next = args[i + 1];
        if (!/^(-|--)[^-]/.test(next) && !flags.bools[key] &&
            (!aliases[key])) {
            setArg(argv, key, next, arg, flags, aliases);
        }
    }
}

function setShortFlagValue(letters, j, next, arg, i, args, flags, argv, aliases) {
    if (next === '-') {
        setArg(argv, letters[j], next, arg, flags, aliases);
        return false;
    }
    if (/[A-Za-z]/.test(letters[j]) && /=/.test(next)) {
        setArg(argv, letters[j], next.split('=')[1], arg, flags, aliases);
        return true;
    }
    if (/[A-Za-z]/.test(letters[j]) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
        setArg(argv, letters[j], next, arg, flags, aliases);
        return true;
    }
    if (letters[j + 1] && letters[j + 1].match(/\W/)) {
        setArg(argv, letters[j], arg.slice(j + 2), arg, flags, aliases);
        return true;
    }
    setArg(argv, letters[j], flags.strings[letters[j]] ? '' : true, arg, flags, aliases);
    return false;
}

function setArg(argv, key, val, arg, flags, aliases) {
    if (arg && flags.unknownFn && !argDefined(key, arg, flags, aliases)) {
        if (flags.unknownFn(arg) === false) return;
    }
    const value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
    setKey(argv, key.split('.'), value);
    (aliases[key] || []).forEach(x => setKey(argv, x.split('.'), value));
}

function setKey(obj, keys, value) {
    let o = obj;
    keys.slice(0, -1).forEach(key => {
        if (!o[key] || typeof o[key] !== 'object') o[key] = {};
        o = o[key];
    });
    const lastKey = keys[keys.length - 1];
    if (!o[lastKey] || typeof o[lastKey] === 'boolean' || flags.bools[lastKey]) {
        o[lastKey] = value;
    } else if (Array.isArray(o[lastKey])) {
        o[lastKey].push(value);
    } else {
        o[lastKey] = [o[lastKey], value];
    }
}

function argDefined(key, arg, flags, aliases) {
    return (flags.bools[key] && /^--[^=]+$/.test(arg)) ||
        flags.strings[key] || flags.bools[key] || aliases[key];
}

function applyDefaults(defaults, argv, aliases) {
    Object.keys(defaults).forEach(key => {
        if (!hasKey(argv, key.split('.'))) {
            setKey(argv, key.split('.'), defaults[key]);
            (aliases[key] || []).forEach(x => setKey(argv, x.split('.'), defaults[key]));
        }
    });
}

function handleNotFlags(opts, notFlags, argv) {
    if (opts['--']) {
        argv['--'] = [...notFlags];
    } else {
        argv._.push(...notFlags);
    }
}

function hasKey(obj, keys) {
    return keys.every((key, idx) => (obj = obj[key]) != null);
}

function isNumber(x) {
    return typeof x === 'number' || /^0x[\da-f]+$/i.test(x) ||
        /^[-+]?\d+(\.\d*)?([eE]([-+]?\d+))?$/.test(x);
}

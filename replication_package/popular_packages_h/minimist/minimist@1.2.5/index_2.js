module.exports = function (args, opts = {}) {
    const flags = { bools: {}, strings: {}, unknownFn: null, allBools: false };
    if (typeof opts['unknown'] === 'function') flags.unknownFn = opts['unknown'];

    [].concat(opts['boolean']).filter(Boolean).forEach(key => flags.bools[key] = true);
    flags.allBools = typeof opts['boolean'] === 'boolean' && opts['boolean'];

    const aliases = {};
    Object.entries(opts.alias || {}).forEach(([key, values]) => {
        aliases[key] = [].concat(values);
        aliases[key].forEach(val => {
            aliases[val] = [key, ...aliases[key].filter(alias => alias !== val)];
        });
    });

    [].concat(opts.string).filter(Boolean).forEach(key => {
        flags.strings[key] = true;
        if (aliases[key]) aliases[key].forEach(alias => flags.strings[alias] = true);
    });

    const defaults = opts['default'] || {};
    const argv = { _: [] };
    Object.keys(flags.bools).forEach(key => setArg(key, defaults[key] !== undefined ? defaults[key] : false));

    let notFlags = [];
    if (args.includes('--')) {
        notFlags = args.slice(args.indexOf('--') + 1);
        args = args.slice(0, args.indexOf('--'));
    }

    function argDefined(key, arg) {
        return flags.allBools && /^--[^=]+$/.test(arg) || flags.strings[key] || flags.bools[key] || aliases[key];
    }

    function setArg(key, val, arg) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false) return;
        }
        const value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
        setKey(argv, key.split('.'), value);
        (aliases[key] || []).forEach(alias => setKey(argv, alias.split('.'), value));
    }

    function setKey(obj, keys, value) {
        let o = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (key === '__proto__') return;
            if (o[key] === undefined) o[key] = {};
            o = o[key];
        }
        const key = keys[keys.length - 1];
        if (key === '__proto__') return;
        if (o[key] === undefined || flags.bools[key] || typeof o[key] === 'boolean') o[key] = value;
        else if (Array.isArray(o[key])) o[key].push(value);
        else o[key] = [o[key], value];
    }

    function aliasIsBoolean(key) {
        return (aliases[key] || []).some(alias => flags.bools[alias]);
    }

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (/^--.+=/.test(arg)) {
            const [_, key, value] = /^--([^=]+)=([\s\S]*)$/.exec(arg);
            setArg(key, flags.bools[key] ? value !== 'false' : value, arg);
        } else if (/^--no-.+/.test(arg)) {
            const key = arg.match(/^--no-(.+)/)[1];
            setArg(key, false, arg);
        } else if (/^--.+/.test(arg)) {
            const key = arg.match(/^--(.+)/)[1];
            const next = args[i + 1];
            if (next !== undefined && !/^-/.test(next) && !flags.bools[key] && !flags.allBools && (!aliases[key] || !aliasIsBoolean(key))) {
                setArg(key, next, arg);
                i++;
            } else if (/^(true|false)$/.test(next)) {
                setArg(key, next === 'true', arg);
                i++;
            } else {
                setArg(key, flags.strings[key] ? '' : true, arg);
            }
        } else if (/^-[^-]+/.test(arg)) {
            const letters = arg.slice(1, -1).split('');
            let broken = false;
            for (let j = 0; j < letters.length; j++) {
                const next = arg.slice(j + 2);
                if (next === '-') {
                    setArg(letters[j], next, arg);
                    continue;
                }
                if (/=/.test(next)) {
                    setArg(letters[j], next.split('=')[1], arg);
                    broken = true;
                    break;
                }
                if (/-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }
                setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
            }
            const key = arg.slice(-1)[0];
            if (!broken && key !== '-') {
                if (args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1]) && !flags.bools[key] && (!aliases[key] || !aliasIsBoolean(key))) {
                    setArg(key, args[i + 1], arg);
                    i++;
                } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
                    setArg(key, args[i + 1] === 'true', arg);
                    i++;
                } else {
                    setArg(key, flags.strings[key] ? '' : true, arg);
                }
            }
        } else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(flags.strings['_'] || !isNumber(arg) ? arg : Number(arg));
            }
            if (opts.stopEarly) {
                argv._.push(...args.slice(i + 1));
                break;
            }
        }
    }

    Object.keys(defaults).forEach(key => {
        if (!hasKey(argv, key.split('.'))) {
            setKey(argv, key.split('.'), defaults[key]);
            (aliases[key] || []).forEach(alias => setKey(argv, alias.split('.'), defaults[key]));
        }
    });

    if (opts['--']) argv['--'] = [...notFlags];
    else argv._.push(...notFlags);

    return argv;
};

function hasKey(obj, keys) {
    return keys.slice(0, -1).reduce((res, key) => res && res[key], obj) && (keys[keys.length - 1] in obj);
}

function isNumber(x) {
    return typeof x === 'number' || /^0x[0-9a-f]+$/i.test(x) || /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

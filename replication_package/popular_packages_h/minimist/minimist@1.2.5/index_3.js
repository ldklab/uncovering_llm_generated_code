module.exports = function (args, opts = {}) {
    const flags = { bools: {}, strings: {}, unknownFn: null };
    if (typeof opts.unknown === 'function') {
        flags.unknownFn = opts.unknown;
    }
    
    flags.allBools = opts.boolean === true;
    [].concat(opts.boolean).filter(Boolean).forEach(key => flags.bools[key] = true);
    
    const aliases = {};
    Object.entries(opts.alias || {}).forEach(([key, value]) => {
        aliases[key] = [].concat(value);
        aliases[key].forEach(x => {
            aliases[x] = [key, ...aliases[key].filter(y => x !== y)];
        });
    });

    [].concat(opts.string).filter(Boolean).forEach(key => {
        flags.strings[key] = true;
        if (aliases[key]) {
            aliases[key].forEach(alias => flags.strings[alias] = true);
        }
    });

    const defaults = opts.default || {};
    const argv = { _: [] };
    Object.keys(flags.bools).forEach(key => setArg(key, defaults[key] ?? false));

    let notFlags = [];
    if (args.includes('--')) {
        const index = args.indexOf('--');
        notFlags = args.slice(index + 1);
        args = args.slice(0, index);
    }

    args.forEach((arg, i) => {
        const next = args[i + 1];
        
        if (/^--.+=/.test(arg)) {
            const [_, key, value] = arg.match(/^--([^=]+)=([\s\S]*)$/);
            setArg(key, flags.bools[key] ? value !== 'false' : value, arg);
        } else if (/^--no-/.test(arg)) {
            setArg(arg.slice(5), false, arg);
        } else if (/^--/.test(arg)) {
            const key = arg.slice(2);
            if (next && !/^(-|--)[^-]/.test(next) && !flags.bools[key] && !flags.allBools && (!(aliases[key] && aliasIsBoolean(key)))) {
                setArg(key, next, arg);
                args.splice(i, 1);
            } else {
                const value = /^(true|false)$/.test(next) ? next === 'true' : !flags.strings[key];
                setArg(key, value, arg);
            }
        } else if (/^-[^-]/.test(arg)) {
            const letters = arg.slice(1, -1);
            const key = arg.slice(-1);
            for (let j = 0; j < letters.length; j++) {
                const currentKey = letters[j];
                const restArg = arg.slice(j + 2);
                
                if (/=/.test(restArg)) {
                    setArg(currentKey, restArg.split('=')[1], arg);
                    break;
                } 

                if (/^\d/.test(restArg)) {
                    setArg(currentKey, restArg, arg);
                    break;
                } 

                setArg(currentKey, true, arg);
            }

            if (!flags.bools[key] && next && !/^(-|--)[^-]/.test(next) && (!(aliases[key] && aliasIsBoolean(key)))) {
                setArg(key, next, arg);
                args.splice(i, 1);
            } else {
                setArg(key, true, arg);
            }
        } else {
            pushToArgv(argv, flags, opts, arg);
            if (opts.stopEarly) {
                argv._.push(...args.slice(i + 1));
                return;
            }
        }
    });

    for (const [key, value] of Object.entries(defaults)) {
        if (!hasKey(argv, key.split('.'))) {
            setKey(argv, key.split('.'), value);
            aliases[key]?.forEach(alias => setKey(argv, alias.split('.'), value));
        }
    }
    
    if (opts['--']) {
        argv['--'] = notFlags;
    } else {
        argv._.push(...notFlags);
    }

    return argv;

    function pushToArgv(argv, flags, opts, arg) {
        if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
            argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
        }
    }

    function argDefined(key, arg) {
        return (flags.allBools && /^--[^=]+$/.test(arg)) || flags.strings[key] || flags.bools[key] || aliases[key];
    }

    function setArg(key, val, arg = null) {
        if (flags.unknownFn && arg && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false) return;
        }
        
        const value = (!flags.strings[key] && isNumber(val)) ? Number(val) : val;
        setKey(argv, key.split('.'), value);
        (aliases[key] || []).forEach(x => setKey(argv, x.split('.'), value));
    }

    function setKey(obj, keys, value) {
        let o = obj;
        keys.slice(0, -1).forEach(key => {
            if (key !== '__proto__') {
                o[key] = o[key] ?? {};
                o = o[key];
            }
        });
        
        const lastKey = keys[keys.length - 1];
        if (lastKey !== '__proto__') {
            o[lastKey] = o[lastKey] ?? (flags.bools[lastKey] || typeof o[lastKey] === 'boolean' ? value : Array.isArray(o[lastKey]) ? [...o[lastKey], value] : [o[lastKey], value]);
        }
    }

    function aliasIsBoolean(key) {
        return aliases[key]?.some(x => flags.bools[x]);
    }

    function hasKey(obj, keys) {
        return keys.slice(0, -1).reduce((o, key) => o?.[key], obj)?.hasOwnProperty(keys[keys.length - 1]);
    }

    function isNumber(x) {
        return typeof x === 'number' || /^0x[0-9a-f]+$/i.test(x) || /^[-+]?(?:\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
    }
};

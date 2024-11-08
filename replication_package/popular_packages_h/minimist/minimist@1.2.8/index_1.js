'use strict';

function hasKey(obj, keys) {
    let current = obj;
    keys.slice(0, -1).forEach(function (key) {
        current = current[key] || {};
    });

    let lastKey = keys[keys.length - 1];
    return lastKey in current;
}

function isNumber(value) {
    if (typeof value === 'number') return true;
    if ((/^0x[0-9a-f]+$/i).test(value)) return true;
    return (/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/).test(value);
}

function isConstructorOrProto(obj, key) {
    return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
}

module.exports = function (args, opts) {
    if (!opts) opts = {};

    const flags = {
        bools: {},
        strings: {},
        unknownFn: null,
    };

    if (typeof opts.unknown === 'function') {
        flags.unknownFn = opts.unknown;
    }

    if (opts.boolean === true) {
        flags.allBools = true;
    } else {
        [].concat(opts.boolean).filter(Boolean).forEach(key => {
            flags.bools[key] = true;
        });
    }

    const aliases = {};
    function aliasIsBoolean(key) {
        return aliases[key].some(x => flags.bools[x]);
    }

    Object.keys(opts.alias || {}).forEach(key => {
        aliases[key] = [].concat(opts.alias[key]);
        aliases[key].forEach(x => {
            aliases[x] = [key].concat(aliases[key].filter(y => x !== y));
        });
    });

    [].concat(opts.string).filter(Boolean).forEach(key => {
        flags.strings[key] = true;
        if (aliases[key]) {
            [].concat(aliases[key]).forEach(k => {
                flags.strings[k] = true;
            });
        }
    });

    const defaults = opts.default || {};

    const argv = { _: [] };

    function argDefined(key, arg) {
        return (flags.allBools && (/^--[^=]+$/).test(arg))
            || flags.strings[key]
            || flags.bools[key]
            || aliases[key];
    }

    function setKey(obj, keys, value) {
        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            let key = keys[i];
            if (isConstructorOrProto(current, key)) return;
            if (current[key] === undefined) current[key] = {};
            if (
                current[key] === Object.prototype
                || current[key] === Number.prototype
                || current[key] === String.prototype
            ) {
                current[key] = {};
            }
            if (current[key] === Array.prototype) current[key] = [];
            current = current[key];
        }

        let lastKey = keys[keys.length - 1];
        if (isConstructorOrProto(current, lastKey)) return;
        if (
            current === Object.prototype
            || current === Number.prototype
            || current === String.prototype
        ) {
            current = {};
        }
        if (current === Array.prototype) {
            current = [];
        }
        if (current[lastKey] === undefined || flags.bools[lastKey] || typeof current[lastKey] === 'boolean') {
            current[lastKey] = value;
        } else if (Array.isArray(current[lastKey])) {
            current[lastKey].push(value);
        } else {
            current[lastKey] = [current[lastKey], value];
        }
    }

    function setArg(key, val, arg) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false) return;
        }

        const value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
        setKey(argv, key.split('.'), value);

        (aliases[key] || []).forEach(x => {
            setKey(argv, x.split('.'), value);
        });
    }

    Object.keys(flags.bools).forEach(key => {
        setArg(key, defaults[key] === undefined ? false : defaults[key]);
    });

    let notFlags = [];
    if (args.indexOf('--') !== -1) {
        notFlags = args.slice(args.indexOf('--') + 1);
        args = args.slice(0, args.indexOf('--'));
    }

    for (let i = 0; i < args.length; i++) {
        let arg = args[i];
        let key;
        let next;

        if ((/^--.+=/).test(arg)) {
            const match = arg.match(/^--([^=]+)=([\s\S]*)$/);
            key = match[1];
            let value = match[2];
            if (flags.bools[key]) {
                value = value !== 'false';
            }
            setArg(key, value, arg);
        } else if ((/^--no-.+/).test(arg)) {
            key = arg.match(/^--no-(.+)/)[1];
            setArg(key, false, arg);
        } else if ((/^--.+/).test(arg)) {
            key = arg.match(/^--(.+)/)[1];
            next = args[i + 1];
            if (
                next !== undefined
                && !(/^(-|--)[^-]/).test(next)
                && !flags.bools[key]
                && !flags.allBools
                && (aliases[key] ? !aliasIsBoolean(key) : true)
            ) {
                setArg(key, next, arg);
                i += 1;
            } else if ((/^(true|false)$/).test(next)) {
                setArg(key, next === 'true', arg);
                i += 1;
            } else {
                setArg(key, flags.strings[key] ? '' : true, arg);
            }
        } else if ((/^-[^-]+/).test(arg)) {
            const letters = arg.slice(1, -1).split('');

            let broken = false;
            for (let j = 0; j < letters.length; j++) {
                next = arg.slice(j + 2);

                if (next === '-') {
                    setArg(letters[j], next, arg);
                    continue;
                }

                if ((/[A-Za-z]/).test(letters[j]) && next[0] === '=') {
                    setArg(letters[j], next.slice(1), arg);
                    broken = true;
                    break;
                }

                if (
                    (/[A-Za-z]/).test(letters[j])
                    && (/-?\d+(\.\d*)?(e-?\d+)?$/).test(next)
                ) {
                    setArg(letters[j], next, arg);
                    broken = true;
                    break;
                }

                if (letters[j + 1] && letters[j + 1].match(/\W/)) {
                    setArg(letters[j], arg.slice(j + 2), arg);
                    broken = true;
                    break;
                } else {
                    setArg(letters[j], flags.strings[letters[j]] ? '' : true, arg);
                }
            }

            key = arg.slice(-1)[0];
            if (!broken && key !== '-') {
                if (
                    args[i + 1]
                    && !(/^(-|--)[^-]/).test(args[i + 1])
                    && !flags.bools[key]
                    && (aliases[key] ? !aliasIsBoolean(key) : true)
                ) {
                    setArg(key, args[i + 1], arg);
                    i += 1;
                } else if (args[i + 1] && (/^(true|false)$/).test(args[i + 1])) {
                    setArg(key, args[i + 1] === 'true', arg);
                    i += 1;
                } else {
                    setArg(key, flags.strings[key] ? '' : true, arg);
                }
            }
        } else {
            if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
                argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
            }
            if (opts.stopEarly) {
                argv._.push(...args.slice(i + 1));
                break;
            }
        }
    }

    Object.keys(defaults).forEach(k => {
        if (!hasKey(argv, k.split('.'))) {
            setKey(argv, k.split('.'), defaults[k]);

            (aliases[k] || []).forEach(x => {
                setKey(argv, x.split('.'), defaults[k]);
            });
        }
    });

    if (opts['--']) {
        argv['--'] = notFlags.slice();
    } else {
        notFlags.forEach(k => {
            argv._.push(k);
        });
    }

    return argv;
};

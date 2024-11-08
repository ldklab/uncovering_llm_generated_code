'use strict';

function hasKey(obj, keys) {
    var o = obj;
    keys.slice(0, -1).forEach(function (key) {
        o = o[key] || {};
    });

    var key = keys[keys.length - 1];
    return key in o;
}

function isNumber(value) {
    if (typeof value === 'number') return true;
    if (/^0x[0-9a-f]+$/i.test(value)) return true;
    return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(value);
}

function isConstructorOrProto(obj, key) {
    return (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';
}

module.exports = function parseArgs(args, opts = {}) {
    const flags = {
        bools: {},
        strings: {},
        unknownFn: typeof opts.unknown === 'function' ? opts.unknown : null,
        allBools: opts.boolean === true
    };

    if (!flags.allBools) {
        [].concat(opts.boolean || []).filter(Boolean).forEach(key => {
            flags.bools[key] = true;
        });
    }

    const aliases = {};
    Object.keys(opts.alias || {}).forEach(key => {
        aliases[key] = [].concat(opts.alias[key]);
        aliases[key].forEach(alias => {
            aliases[alias] = [key].concat(aliases[key].filter(y => y !== alias));
        });
    });

    [].concat(opts.string || []).filter(Boolean).forEach(key => {
        flags.strings[key] = true;
        if (aliases[key]) {
            aliases[key].forEach(alias => {
                flags.strings[alias] = true;
            });
        }
    });

    const defaults = opts.default || {};
    const argv = { _: [] };

    function argDefined(key, arg) {
        return (flags.allBools && /^--[^=]+$/.test(arg)) ||
            flags.strings[key] ||
            flags.bools[key] ||
            aliases[key];
    }

    function setKey(obj, keys, value) {
        let o = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (isConstructorOrProto(o, key)) return;
            if (o[key] === undefined) o[key] = {};
            if (
                [Object.prototype, Number.prototype, String.prototype].includes(o[key])
            ) o[key] = {};
            if (o[key] === Array.prototype) o[key] = [];
            o = o[key];
        }

        const lastKey = keys[keys.length - 1];
        if (isConstructorOrProto(o, lastKey)) return;
        if (
            [Object.prototype, Number.prototype, String.prototype].includes(o)
        ) o = {};
        if (o === Array.prototype) o = [];
        if (o[lastKey] === undefined || flags.bools[lastKey] || typeof o[lastKey] === 'boolean') {
            o[lastKey] = value;
        } else if (Array.isArray(o[lastKey])) {
            o[lastKey].push(value);
        } else {
            o[lastKey] = [o[lastKey], value];
        }
    }

    function setArg(key, val, arg) {
        if (arg && flags.unknownFn && !argDefined(key, arg)) {
            if (flags.unknownFn(arg) === false) return;
        }

        const value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
        setKey(argv, key.split('.'), value);

        (aliases[key] || []).forEach(alias => {
            setKey(argv, alias.split('.'), value);
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

    args.forEach((arg, i) => {
        let key, next, value;

        if (/^--.+=/.test(arg)) {
            const m = arg.match(/^--([^=]+)=(.*)$/);
            key = m[1];
            value = m[2];
            if (flags.bools[key]) {
                value = value !== 'false';
            }
            setArg(key, value, arg);
        } else if (/^--no-.+/.test(arg)) {
            key = arg.match(/^--no-(.+)/)[1];
            setArg(key, false, arg);
        } else if (/^--.+/.test(arg)) {
            key = arg.match(/^--(.+)/)[1];
            next = args[i + 1];
            if (
                next !== undefined && !/^(-|--)[^-]/.test(next) &&
                !flags.bools[key] && !flags.allBools &&
                (!aliases[key] || !aliasIsBoolean(key))
            ) {
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

            letters.forEach((letter, j) => {
                next = arg.slice(j + 2);

                if (next === '-') {
                    setArg(letter, next, arg);
                    return;
                }

                if (/[A-Za-z]/.test(letter) && next[0] === '=') {
                    setArg(letter, next.slice(1), arg);
                    broken = true;
                    return;
                }

                if (/[A-Za-z]/.test(letter) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
                    setArg(letter, next, arg);
                    broken = true;
                    return;
                }

                if (letters[j + 1] && /\W/.test(letters[j + 1])) {
                    setArg(letter, arg.slice(j + 2), arg);
                    broken = true;
                    return;
                } else {
                    setArg(letter, flags.strings[letter] ? '' : true, arg);
                }
            });

            if (!broken) {
                key = arg.slice(-1)[0];
                if (
                    args[i + 1] && !/^(-|--)[^-]/.test(args[i + 1]) &&
                    !flags.bools[key] && (!aliases[key] || !aliasIsBoolean(key))
                ) {
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
                argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
            }
            if (opts.stopEarly) {
                argv._.push(...args.slice(i + 1));
                return;
            }
        }
    });

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

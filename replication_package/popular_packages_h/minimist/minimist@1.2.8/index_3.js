'use strict';

const hasKey = (obj, keys) => {
  let o = obj;
  keys.slice(0, -1).forEach(key => {
    o = o[key] || {};
  });
  const key = keys[keys.length - 1];
  return key in o;
};

const isNumber = x => {
  if (typeof x === 'number') return true;
  return /^0x[0-9a-f]+$/i.test(x) || /^[-+]?(\d+(\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
};

const isConstructorOrProto = (obj, key) =>
  (key === 'constructor' && typeof obj[key] === 'function') || key === '__proto__';

module.exports = function (args, opts = {}) {
  const flags = {
    bools: {},
    strings: {},
    unknownFn: typeof opts.unknown === 'function' ? opts.unknown : null,
    allBools: typeof opts.boolean === 'boolean' && opts.boolean
  };

  [].concat(opts.boolean).filter(Boolean).forEach(key => {
    flags.bools[key] = true;
  });

  const aliases = {};
  Object.keys(opts.alias || {}).forEach(key => {
    aliases[key] = [].concat(opts.alias[key]);
    aliases[key].forEach(alias => {
      aliases[alias] = [key, ...aliases[key].filter(y => alias !== y)];
    });
  });

  [].concat(opts.string).filter(Boolean).forEach(key => {
    flags.strings[key] = true;
    if (aliases[key]) {
      aliases[key].forEach(alias => {
        flags.strings[alias] = true;
      });
    }
  });

  const defaults = opts.default || {};
  const argv = { _: [] };

  const argDefined = (key, arg) =>
    (flags.allBools && /^--[^=]+$/.test(arg))
    || flags.strings[key]
    || flags.bools[key]
    || aliases[key];

  const setKey = (obj, keys, value) => {
    let o = obj;
    keys.slice(0, -1).forEach(key => {
      if (isConstructorOrProto(o, key)) return;
      if (o[key] === undefined) o[key] = {};
      if ([Object.prototype, Number.prototype, String.prototype].includes(o[key])) o[key] = {};
      if (o[key] === Array.prototype) o[key] = [];
      o = o[key];
    });

    const lastKey = keys[keys.length - 1];
    if (isConstructorOrProto(o, lastKey)) return;
    o = [Object.prototype, Number.prototype, String.prototype].includes(o) ? {} : o;
    if (o === Array.prototype) o = [];
    if (o[lastKey] === undefined || flags.bools[lastKey] || typeof o[lastKey] === 'boolean') {
      o[lastKey] = value;
    } else if (Array.isArray(o[lastKey])) {
      o[lastKey].push(value);
    } else {
      o[lastKey] = [o[lastKey], value];
    }
  };

  const setArg = (key, val, arg) => {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) return;
    }
    const value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
    setKey(argv, key.split('.'), value);
    (aliases[key] || []).forEach(alias => {
      setKey(argv, alias.split('.'), value);
    });
  };

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

    const matches = /^--([^=]+)=([\s\S]*)$/.exec(arg);
    if (matches) {
      key = matches[1];
      let value = matches[2];
      if (flags.bools[key]) value = value !== 'false';
      setArg(key, value, arg);
    } else if (/^--no-.+/.test(arg)) {
      key = arg.match(/^--no-(.+)/)[1];
      setArg(key, false, arg);
    } else if (/^--.+/.test(arg)) {
      key = arg.match(/^--(.+)/)[1];
      next = args[i + 1];
      if (
        next !== undefined
        && !/^(-|--)[^-]/.test(next)
        && !flags.bools[key]
        && !flags.allBools
        && (aliases[key] ? !aliasIsBoolean(key) : true)
      ) {
        setArg(key, next, arg);
        i += 1;
      } else if (/^(true|false)$/.test(next)) {
        setArg(key, next === 'true', arg);
        i += 1;
      } else {
        setArg(key, flags.strings[key] ? '' : true, arg);
      }
    } else if (/^-[^-]+/.test(arg)) {
      const letters = arg.slice(1, -1).split('');
      let broken = false;

      for (let j = 0; j < letters.length; j++) {
        next = arg.slice(j + 2);

        if (next === '-') {
          setArg(letters[j], next, arg);
          continue;
        }

        if (/[A-Za-z]/.test(letters[j]) && next[0] === '=') {
          setArg(letters[j], next.slice(1), arg);
          broken = true;
          break;
        }

        if (/[A-Za-z]/.test(letters[j]) && /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)) {
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
          && !/^(-|--)[^-]/.test(args[i + 1])
          && !flags.bools[key]
          && (aliases[key] ? !aliasIsBoolean(key) : true)
        ) {
          setArg(key, args[i + 1], arg);
          i += 1;
        } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
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

      (aliases[k] || []).forEach(alias => {
        setKey(argv, alias.split('.'), defaults[k]);
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

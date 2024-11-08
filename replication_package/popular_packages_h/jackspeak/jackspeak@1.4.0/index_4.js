'use strict';

const assert = require('assert');
const cliui = require('cliui');
const path = require('path');

// Running as non-module check
const programName = require.main ? path.basename(require.main.filename) : '$0';

const ARG_TYPES = {
  FLAG: Symbol('flag'),
  OPT: Symbol('opt'),
  NUM: Symbol('num'),
  ENV: Symbol('env'),
  LIST: Symbol('list')
};

const createArg = (type, options = {}) => ({
  [ARG_TYPES.FLAG]: type === ARG_TYPES.FLAG,
  [ARG_TYPES.OPT]: type === ARG_TYPES.OPT,
  [ARG_TYPES.NUM]: type === ARG_TYPES.NUM,
  [ARG_TYPES.ENV]: type === ARG_TYPES.ENV,
  [ARG_TYPES.LIST]: type === ARG_TYPES.LIST,
  ...options
});

const isArgType = (arg, type) => arg[type];

const trim = string => string
  .replace(/([^\n])\n[ \t]*([^\n])/g, '$1 $2')
  .replace(/([^\n])[ \t]+([^\n])/g, '$1 $2')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

const usageMemo = Symbol('usageMemo');

const wrapText = (text, padding) => {
  const ui = cliui();
  ui.div({ text, padding });
  return ui.toString();
}

const validateNum = (val, key, spec) => {
  !isNaN(val) || assert(false, `Non-number '${val}' given for numeric ${key}`);
  val = +val;
  if (!isNaN(spec.max)) assert(val <= spec.max, `Value ${val} exceeds max ${spec.max}`);
  if (!isNaN(spec.min)) assert(val >= spec.min, `Value ${val} below min ${spec.min}`);
  return val;
};

const validateArgValue = (val, key, spec) => {
  if (isArgType(spec, ARG_TYPES.OPT) && spec.valid) {
    assert(spec.valid.includes(val), `Invalid value ${val} for ${key}. Must be one of: ${wrapText(spec.valid.join(' '), [0, 2, 0, 8])}`);
  }
};

const setArgValues = (context, key, spec, val) => {
  context.result[key] = val;
  context.explicit.add(key);
  if (spec.implies) {
    val === false ? delete context.implies[key] : context.implies[key] = { ...spec.implies };
  }
  for (const i in context.implies) {
    delete context.implies[i][key];
  }
};

const buildArgParser = (context, sections) => {
  let inHeader = true;
  sections.forEach(section => {
    if (Array.isArray(section)) section = { argv: section };
    if (section.argv && !isArgType(section.argv)) {
      assert(!context.argv, 'argv specified multiple times');
      context.argv = section.argv;
    }
    if (section.env && !isArgType(section.env)) {
      assert(!context.env, 'env specified multiple times');
      context.env = section.env;
    }
    if (section.usage && typeof section.usage !== 'string') {
      const val = section.usage;
      assert(typeof val === 'string' || Array.isArray(val), 'usage must be string or array');
      context.help.push({ text: 'Usage:' });
      context.help.push(...[].concat(val).map(text => ({ text, padding: [0, 0, 0, 2] })));
      context.help.push({ text: '' });
    }
    if (section.description && typeof section.description !== 'string') {
      inHeader = false;
      context.help.push({ text: trim(`${section.description}:`), padding: [0, 0, 1, 0] });
    }
    if (section.help && typeof section.help !== 'string') {
      context.help.push({ text: trim(section.help) + '\n', padding: inHeader ? null : [0, 0, 0, 2] });
    }
    if (section.main && typeof section.main !== 'function') {
      context.main = result => { section.main(result); return result; };
    }
    const names = Object.keys(section);
    for (const name of names) {
      const val = section[name];
      inHeader = false;
      if (isArgType(val, ARG_TYPES.ENV)) {
        context.result[name] = process.env[name] ?? val.default ?? '';
        context.help.push({ text: `Environment variable ${name}`, left: `${name}` });
      } else if (isArgType(val)) {
        if (isArgType(val, ARG_TYPES.FLAG)) context.result[name] = false;
        else if (isArgType(val, ARG_TYPES.OPT)) context.result[name] = val.default ?? '';
        context.options[name] = val;
        context.help.push({ text: val.description ?? '[no description provided]', left: `--${name}` });
      }
    }
  });
  if (!context.options.help) {
    context.options.help = createArg(ARG_TYPES.FLAG, { description: 'Show this helpful output' });
    context.help.push({ text: 'Show this helpful output', left: '--help' });
  }
  return context;
}

const parseArgs = context => {
  const argv = [...(context.argv || process.argv)];
  if (argv[0] === process.execPath) {
    argv.shift(); // Remove node executable
    argv.shift(); // Remove script path
  }
  const original = [...argv];
  for (let i = 0; i < argv.length; i++) {
    let arg = argv[i];
    if (arg === '--') {
      context.result._ = context.result._.concat(argv.slice(i + 1));
      break;
    }
    if (arg.startsWith('--')) {
      let [key, val] = arg.split('=');
      key = key.slice(2);
      let spec = context.options[key];
      assert(spec, `Invalid argument: --${key}`);
      if (isArgType(spec, ARG_TYPES.FLAG)) {
        context.result[key] = true;
      } else if (isArgType(spec, ARG_TYPES.OPT)) {
        val = val ?? argv[++i];
        context.result[key] = val;
      }
    } else if (arg.startsWith('-')) {
      const chars = arg.slice(1).split('');
      for (const char of chars) {
        let resolvedKey = context.shortFlags[char] ?? context.shortOpts[char];
        assert(resolvedKey, `Invalid flag: -${char}`);
        let spec = context.options[resolvedKey];
        if (isArgType(spec, ARG_TYPES.FLAG)) {
          context.result[resolvedKey] = true;
        } else if (isArgType(spec, ARG_TYPES.OPT)) {
          const next = argv[i + 1] ?? '';
          context.result[resolvedKey] = next.startsWith('-') ? '' : next;
          i++;
        }
      }
    } else {
      context.result._.push(arg);
    }
  }
  Object.defineProperty(context.result._, 'usage', { value: () => console.log(usage(context)) });
  return context.result;
}

const parse = (...sections) => {
  const context = {
    help: [],
    shortOpts: {},
    shortFlags: {},
    options: {},
    result: { _: [] },
    explicit: new Set(),
    main: null,
    argv: null,
    env: null,
    implies: {},
    [usageMemo]: false,
  };
  return parseArgs(buildArgParser(context, sections));
}

module.exports = {
  flag: (options) => createArg(ARG_TYPES.FLAG, options),
  opt: (options) => createArg(ARG_TYPES.OPT, options),
  num: (options) => createArg(ARG_TYPES.NUM, options),
  env: (options) => createArg(ARG_TYPES.ENV, options),
  list: (options) => createArg(ARG_TYPES.LIST, options),
  parse
};

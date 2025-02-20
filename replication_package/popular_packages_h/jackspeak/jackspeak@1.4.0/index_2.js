'use strict';

const assert = require('assert');
const cliui = require('cliui');
const path = require('path');

const $0 = require.main ? path.basename(require.main.filename) : '$0';

const _symbols = {
  flag: Symbol('flag'),
  opt: Symbol('opt'),
  num: Symbol('num'),
  env: Symbol('env'),
  list: Symbol('list')
};

const flag = options => ({
  ...getDefaults(),
  ...options,
  [_symbols.flag]: true
});

const isFlag = arg => arg[_symbols.flag];

const opt = options => ({
  ...getDefaults(),
  ...options,
  [_symbols.opt]: true
});

const isOpt = arg => arg[_symbols.opt];

const num = options => (opt({ ...options, [_symbols.num]: true }));

const isNum = arg => arg[_symbols.num];

const env = options => ({
  ...getDefaults(),
  ...options,
  [_symbols.env]: true
});

const isEnv = arg => arg[_symbols.env];

const list = options => ({
  ...getDefaults(),
  ...options,
  [_symbols.list]: true
});

const isList = arg => arg[_symbols.list];

const count = options => list(flag(options));

const isCount = arg => isList(arg) && isFlag(arg);

const getDefaults = () => ({
  [_symbols.num]: false,
  [_symbols.list]: false,
  [_symbols.env]: false,
  [_symbols.opt]: false,
  [_symbols.flag]: false
});

const usageMemo = Symbol('usageMemo');

const usage = j => {
  if (j[usageMemo]) return j[usageMemo];

  const ui = cliui({ width: Math.min(process.stdout.columns || 80, 80) });
  if (!/^Usage:/.test(j.help[0].text)) {
    ui.div('Usage:');
    ui.div({ text: `${$0} <options>`, padding: [0, 0, 1, 2] });
  }

  calculateMaxWidth(j);
  
  j.help.forEach(row => {
    formatHelpRow(ui, row, getMaxWidth(j));
  });

  return j[usageMemo] = ui.toString();
};

const calculateMaxWidth = j => {
  let maxWidth = 8;
  let prev = null;

  j.help.forEach(row => {
    if (row.left) {
      updateWidths(row, prev);
      prev = row;
    } else {
      prev = null;
    }
  });
};

const formatHelpRow = (ui, row, maxWidth) => {
  if (row.left) {
    formatLeftRow(ui, row, maxWidth);
    if (row.skipLine) ui.div();
  } else {
    ui.div(row);
  }
};

const getMaxWidth = j => j.help.reduce((max, row) => Math.max(max, row.left.length + 4), 8);

const formatLeftRow = (ui, row, maxWidth) => {
  if (row.left.length >= maxWidth - 2) {
    ui.div({ text: row.left, padding: [0, 0, 0, 2] });
    ui.div({ text: row.text, padding: [0, 0, 0, maxWidth] });
  } else {
    ui.div({ text: row.left, padding: [0, 1, 0, 2], width: maxWidth }, { text: row.text });
  }
};

const updateWidths = (row, prev) => {
  const width = Math.min(process.stdout.columns || 80, 80);
  if (row.text.length > width - 26) {
    if (prev) prev.skipLine = true;
    row.skipLine = true;
  }
};

const jack = (...sections) => execute(parse_(buildParser(newObj(), sections)));

const buildParser = (j, sections) => {
  sections.forEach(section => {
    processSection(j, section);
  });

  if (!j.options.help) addArg(j, 'help', flag({ description: 'Show this helpful output' }));

  if (!j.options['--']) {
    addHelpText(j, '', flag({
      description: `Stop parsing flags and options, treat any additional command line arguments as positional arguments.`
    }));
  }

  return j;
};

const processSection = (j, section) => {
  if (Array.isArray(section)) section = { argv: section };

  if (section.argv && !isArg(section.argv)) {
    assert(!j.argv, 'argv specified multiple times');
    j.argv = section.argv;
  }

  setSectionAttributes(j, section, 'env');
  setSectionAttributes(j, section, 'usage');
  setSectionAttributes(j, section, 'description');
  setSectionAttributes(j, section, 'help');
  setSectionAttributes(j, section, 'main');

  const names = Object.keys(section);
  names.forEach(name => processSectionName(j, name, section));
};

const setSectionAttributes = (j, section, attr) => {
  if (section[attr] && !isArg(section[attr])) {
    assert(!j[attr], `${attr} specified multiple times`);
    j[attr] = section[attr];
  }
};

const processSectionName = (j, name, section) => {
  if (name === '_' || !isSupportedType(section[name])) return;

  if (isEnv(section[name])) addEnv(j, name, section[name]);
  else if (isArg(section[name])) addArg(j, name, section[name]);
  else {
    assert(false, `${name} not flag, opt, or env`);
  }
};

const isSupportedType = val => ['argv', 'description', 'usage', 'help', 'main', 'env'].every(type => type !== val);

const parse_ = j => {
  const argv = getArgv(j);
  const original = [...argv];

  argv.forEach((arg, i) => {
    processArgument(j, arg, i, argv);
  });

  applyImpliedValues(j);

  setReservedProperties(j, argv, original);

  return j;
};

const processArgument = (j, arg, i, argv) => {
  if (arg.charAt(0) !== '-' || arg === '-') {
    j.result._.push(arg);
    return;
  }

  if (arg === '--') {
    j.result._ = j.result._.concat(argv.slice(i + 1));
    i = argv.length;
    return;
  }

  if (arg.charAt(1) !== '-') {
    expandShortFlags(j, arg, i, argv);
    return;
  }

  parseLongArg(j, arg, i, argv);
};

const expandShortFlags = (j, arg, i, argv) => {
  const expand = [];
  for (let f = 1; f < arg.length; f++) {
    addExpandedShortFlags(j, arg, f, expand);
  }

  if (expand.length) {
    argv.splice(i, 1, ...expand);
  }
};

const addExpandedShortFlags = (j, arg, f, expand) => {
  const fc = arg.charAt(f);
  const sf = j.shortFlags[fc];
  const so = j.shortOpts[fc];

  if (sf) {
    expand.push(`--${sf}`);
  } else if (so) {
    addExpandedShortOption(j, arg, f, so, expand);
  } else if (arg !== `-${fc}`) {
    expand.push(`-${fc}`);
  }
};

const addExpandedShortOption = (j, arg, f, so, expand) => {
  const soslice = arg.slice(f + 1);
  const soval = !soslice || soslice.charAt(0) === '=' ? soslice : `=${soslice}`;

  expand.push(`--${so}${soval}`);
  f = arg.length;
};

const parseLongArg = (j, arg, i, argv) => {
  const [literalKey, ...vals] = arg.split('=');
  const key = literalKey.replace(/^--?/, '');
  const val = vals.length ? vals.join('=') : null;

  const spec = j.options[key];
  assert(spec, `invalid argument: ${literalKey}`);

  parseArgumentValue(j, spec, key, val, i, argv);
};

const parseArgumentValue = (j, spec, key, val, i, argv) => {
  assertArgumentValue(spec, key, val);

  if (spec.alias) {
    const alias = isFlag(spec) ? spec.alias : [].concat(spec.alias).map(a => a.replace(/\$\{value\}/g, val));
    expandAlias(i, alias, argv);
    return;
  }

  const negate = isFlag(spec) && key.startsWith('no-');
  const name = negate ? key.substr(3) : key;

  if (isNum(spec)) {
    validateAndAssignNumber(j, spec, name, val, `arg ${literalKey}`);
  } else {
    assignParsedValue(j, spec, name, val, negate);
  }
};

const assertArgumentValue = (spec, key, val) => {
  if (isFlag(spec)) {
    assert(val === null, `value provided for boolean flag: ${key}`);
  } else if (isOpt(spec) && val === null) {
    val = argv[++i];
    assert(val !== undefined, `no value provided for option: ${key}`);
  }
};

const expandAlias = (i, alias, argv) => {
  argv.splice(i, 1, ...alias);
};

const validateAndAssignNumber = (j, spec, name, val, key) => {
  val = toNum(val, key, spec);
  validateParsedValue(val, key, spec);
  assignParsedValue(j, spec, name, val);
};

const assignParsedValue = (j, spec, name, val, negate = false) => {
  if (isList(spec)) {
    const mergedVal = mergeListValues(j, spec, name, val, negate);
    set(j, name, spec, mergedVal);
  } else {
    const parsedVal = isFlag(spec) ? !negate : val;
    set(j, name, spec, parsedVal);
  }
};

const mergeListValues = (j, spec, name, val, negate) => {
  if (isOpt(spec)) {
    const current = j.result[name] || [];
    return current.concat(val);
  } else {
    const current = j.result[name] || 0;
    return negate ? current - 1 : current + 1;
  }
};

const applyImpliedValues = j => {
  Object.keys(j.implies).forEach(i => {
    Object.keys(j.implies[i]).forEach(k => {
      j.result[k] = j.implies[i][k];
    });
  });
};

const setReservedProperties = (j, argv, original) => {
  defineProperty(j.result._, 'usage', () => console.log(usage(j)));
  defineProperty(j.result._, 'update', update(j));
  defineProperty(j.result._, 'reparse', reparse(j));
  defineProperty(j.result._, 'explicit', j.explicit);
  defineProperty(j.result._, 'parsed', argv);
  defineProperty(j.result._, 'original', original);
};

const defineProperty = (obj, name, value) => {
  Object.defineProperty(obj, name, { value });
};

const execute = j => {
  if (j.result.help) {
    console.log(usage(j));
  } else if (j.main) {
    j.main(j.result);
  }
  return j.result;
};

const parse = (...sections) => parse_(buildParser(newObj(), sections)).result;

const newObj = () => ({
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
  [usageMemo]: false
});

const update = j => args => {
  const argv = [];
  const toArgv = objToArgv(j);

  addArgs(argv, args, toArgv);

  const result = reparse(j)(argv);
  updateResult(j, result);
};

const addArgs = (argv, args, toArgv) => {
  if (typeof args === 'string') {
    argv.push(args);
  } else if (Array.isArray(args)) {
    argv.push(...args);
  } else if (args) {
    argv.push(...toArgv(args));
  }
};

const updateResult = (j, result) => {
  Object.keys(result)
    .filter(k => k !== '_' && !j.explicit.has(k))
    .forEach(k => j.result[k] = result[k]);
};

const reparse = j => args => {
  const argv = Array.isArray(args) ? args : [args];
  return parse_({
    ...j,
    explicit: new Set(),
    result: { _: [] },
    help: [],
    main: null,
    argv
  }).result;
};

const objToArgv = j => obj => {
  return Object.keys(obj).reduce((set, k) => {
    const toArg = kvToArg(j);
    const val = obj[k];
    if (Array.isArray(val)) {
      set.push(...val.map(v => toArg(k, v)));
    } else {
      set.push(toArg(k, val));
    }
    return set;
  }, []);
};

const kvToArg = j => (k, v) => {
  return j.options[k] && isFlag(j.options[k]) ? (v ? `--${k}` : `--no-${k}`)
    : `--${k}=${v}`;
};

const set = (j, key, spec, val) => {
  j.result[key] = val;
  j.explicit.add(key);
  manageImpliedValues(j, key, spec, val);
};

const manageImpliedValues = (j, key, spec, val) => {
  if (spec && spec.implies) {
    if (val === false) {
      delete j.implies[key];
    } else {
      j.implies[key] = { ...spec.implies };
    }
  }
  cleanUpImpliedValues(j, key);
};

const cleanUpImpliedValues = (j, key) => {
  Object.keys(j.implies).forEach(i => {
    delete j.implies[i][key];
  });
};

module.exports = { jack, flag, opt, list, count, env, parse, num };

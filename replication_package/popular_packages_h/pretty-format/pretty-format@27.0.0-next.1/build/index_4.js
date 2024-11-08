'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;
exports.default = exports.plugins = void 0;

const ansiStyles = require('ansi-styles').default;
const collections = require('./collections');

const AsymmetricMatcher = require('./plugins/AsymmetricMatcher').default;
const ConvertAnsi = require('./plugins/ConvertAnsi').default;
const DOMCollection = require('./plugins/DOMCollection').default;
const DOMElement = require('./plugins/DOMElement').default;
const Immutable = require('./plugins/Immutable').default;
const ReactElement = require('./plugins/ReactElement').default;
const ReactTestComponent = require('./plugins/ReactTestComponent').default;

const toString = Object.prototype.toString;
const toISOString = Date.prototype.toISOString;
const errorToString = Error.prototype.toString;
const regExpToString = RegExp.prototype.toString;

const getConstructorName = val =>
  typeof val.constructor === 'function' && val.constructor.name || 'Object';
const isWindow = val => typeof window !== 'undefined' && val === window;

const SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;
const NEWLINE_REGEXP = /\n/gi;

class PrettyFormatPluginError extends Error {
  constructor(message, stack) {
    super(message);
    this.stack = stack;
    this.name = this.constructor.name;
  }
}

function isToStringedArrayType(toStringed) {
  return [
    '[object Array]',
    '[object ArrayBuffer]',
    '[object DataView]',
    '[object Float32Array]',
    '[object Float64Array]',
    '[object Int8Array]',
    '[object Int16Array]',
    '[object Int32Array]',
    '[object Uint8Array]',
    '[object Uint8ClampedArray]',
    '[object Uint16Array]',
    '[object Uint32Array]'
  ].includes(toStringed);
}

function printNumber(val) {
  return Object.is(val, -0) ? '-0' : String(val);
}

function printBigInt(val) {
  return `${val}n`;
}

function printFunction(val, printFunctionName) {
  return printFunctionName ? `[Function ${val.name || 'anonymous'}]` : '[Function]';
}

function printSymbol(val) {
  return String(val).replace(SYMBOL_REGEXP, 'Symbol($1)');
}

function printError(val) {
  return `[${errorToString.call(val)}]`;
}

function printBasicValue(val, printFunctionName, escapeRegex, escapeString) {
  if (val === true || val === false) return '' + val;
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';

  const typeOf = typeof val;

  if (typeOf === 'number') return printNumber(val);
  if (typeOf === 'bigint') return printBigInt(val);
  if (typeOf === 'string') return escapeString ? `"${val.replace(/"|\\/g, '\\$&')}"` : `"${val}"`;
  if (typeOf === 'function') return printFunction(val, printFunctionName);
  if (typeOf === 'symbol') return printSymbol(val);

  const toStringed = toString.call(val);

  if (toStringed === '[object WeakMap]') return 'WeakMap {}';
  if (toStringed === '[object WeakSet]') return 'WeakSet {}';
  if (toStringed === '[object Function]' || toStringed === '[object GeneratorFunction]') {
    return printFunction(val, printFunctionName);
  }
  if (toStringed === '[object Symbol]') return printSymbol(val);
  if (toStringed === '[object Date]') return isNaN(+val) ? 'Date { NaN }' : toISOString.call(val);
  if (toStringed === '[object Error]') return printError(val);
  if (toStringed === '[object RegExp]') {
    return escapeRegex ? regExpToString.call(val).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&') : regExpToString.call(val);
  }
  if (val instanceof Error) return printError(val);

  return null;
}

function printComplexValue(val, config, indentation, depth, refs, hasCalledToJSON) {
  if (refs.includes(val)) return '[Circular]';

  refs = refs.slice();
  refs.push(val);
  const hitMaxDepth = ++depth > config.maxDepth;
  const min = config.min;

  if (config.callToJSON && !hitMaxDepth && val.toJSON && typeof val.toJSON === 'function' && !hasCalledToJSON) {
    return printer(val.toJSON(), config, indentation, depth, refs, true);
  }

  const toStringed = toString.call(val);

  if (toStringed === '[object Arguments]') {
    return hitMaxDepth ? '[Arguments]' : (min ? '' : 'Arguments ') + '[' + collections.printListItems(val, config, indentation, depth, refs, printer) + ']';
  }
  if (isToStringedArrayType(toStringed)) {
    return hitMaxDepth ? '[' + val.constructor.name + ']' : (min ? '' : val.constructor.name + ' ') + '[' + collections.printListItems(val, config, indentation, depth, refs, printer) + ']';
  }
  if (toStringed === '[object Map]') {
    return hitMaxDepth ? '[Map]' : 'Map {' + collections.printIteratorEntries(val.entries(), config, indentation, depth, refs, printer, ' => ') + '}';
  }
  if (toStringed === '[object Set]') {
    return hitMaxDepth ? '[Set]' : 'Set {' + collections.printIteratorValues(val.values(), config, indentation, depth, refs, printer) + '}';
  }

  return hitMaxDepth || isWindow(val)
    ? '[' + getConstructorName(val) + ']'
    : (min ? '' : getConstructorName(val) + ' ') + '{' + collections.printObjectProperties(val, config, indentation, depth, refs, printer) + '}';
}

function isNewPlugin(plugin) {
  return plugin.serialize != null;
}

function printPlugin(plugin, val, config, indentation, depth, refs) {
  let printed;
  try {
    printed = isNewPlugin(plugin)
      ? plugin.serialize(val, config, indentation, depth, refs, printer)
      : plugin.print(
          val,
          valChild => printer(valChild, config, indentation, depth, refs),
          str => indentation + config.indent + str.replace(NEWLINE_REGEXP, '\n' + indentation + config.indent),
          { edgeSpacing: config.spacingOuter, min: config.min, spacing: config.spacingInner },
          config.colors
        );
  } catch (error) {
    throw new PrettyFormatPluginError(error.message, error.stack);
  }

  if (typeof printed !== 'string') {
    throw new Error(`pretty-format: Plugin must return type "string" but instead returned "${typeof printed}".`);
  }

  return printed;
}

function findPlugin(plugins, val) {
  for (let plugin of plugins) {
    try {
      if (plugin.test(val)) {
        return plugin;
      }
    } catch (error) {
      throw new PrettyFormatPluginError(error.message, error.stack);
    }
  }
  return null;
}

function printer(val, config, indentation, depth, refs, hasCalledToJSON) {
  const plugin = findPlugin(config.plugins, val);
  if (plugin !== null) {
    return printPlugin(plugin, val, config, indentation, depth, refs);
  }

  const basicResult = printBasicValue(val, config.printFunctionName, config.escapeRegex, config.escapeString);
  if (basicResult !== null) {
    return basicResult;
  }

  return printComplexValue(val, config, indentation, depth, refs, hasCalledToJSON);
}

const DEFAULT_THEME = {
  comment: 'gray',
  content: 'reset',
  prop: 'yellow',
  tag: 'cyan',
  value: 'green'
};
const DEFAULT_THEME_KEYS = Object.keys(DEFAULT_THEME);
const DEFAULT_OPTIONS = {
  callToJSON: true,
  escapeRegex: false,
  escapeString: true,
  highlight: false,
  indent: 2,
  maxDepth: Infinity,
  min: false,
  plugins: [],
  printFunctionName: true,
  theme: DEFAULT_THEME
};

function validateOptions(options) {
  Object.keys(options).forEach(key => {
    if (!DEFAULT_OPTIONS.hasOwnProperty(key)) {
      throw new Error(`pretty-format: Unknown option "${key}".`);
    }
  });

  if (options.min && options.indent !== undefined && options.indent !== 0) {
    throw new Error('pretty-format: Options "min" and "indent" cannot be used together.');
  }

  if (options.theme !== undefined) {
    if (options.theme === null) {
      throw new Error(`pretty-format: Option "theme" must not be null.`);
    }

    if (typeof options.theme !== 'object') {
      throw new Error(`pretty-format: Option "theme" must be of type "object" but instead received "${typeof options.theme}".`);
    }
  }
}

const getColorsHighlight = options =>
  DEFAULT_THEME_KEYS.reduce((colors, key) => {
    const value = options.theme && options.theme[key] !== undefined ? options.theme[key] : DEFAULT_THEME[key];
    const color = value && ansiStyles[value];

    if (color && typeof color.close === 'string' && typeof color.open === 'string') {
      colors[key] = color;
    } else {
      throw new Error(`pretty-format: Option "theme" has a key "${key}" whose value "${value}" is undefined in ansi-styles.`);
    }

    return colors;
  }, Object.create(null));

const getColorsEmpty = () =>
  DEFAULT_THEME_KEYS.reduce((colors, key) => {
    colors[key] = { close: '', open: '' };
    return colors;
  }, Object.create(null));

const getPrintFunctionName = options =>
  options && options.printFunctionName !== undefined ? options.printFunctionName : DEFAULT_OPTIONS.printFunctionName;

const getEscapeRegex = options =>
  options && options.escapeRegex !== undefined ? options.escapeRegex : DEFAULT_OPTIONS.escapeRegex;

const getEscapeString = options =>
  options && options.escapeString !== undefined ? options.escapeString : DEFAULT_OPTIONS.escapeString;

const getConfig = options => ({
  callToJSON: options && options.callToJSON !== undefined ? options.callToJSON : DEFAULT_OPTIONS.callToJSON,
  colors: options && options.highlight ? getColorsHighlight(options) : getColorsEmpty(),
  escapeRegex: getEscapeRegex(options),
  escapeString: getEscapeString(options),
  indent: options && options.min ? '' : createIndent(options && options.indent !== undefined ? options.indent : DEFAULT_OPTIONS.indent),
  maxDepth: options && options.maxDepth !== undefined ? options.maxDepth : DEFAULT_OPTIONS.maxDepth,
  min: options && options.min !== undefined ? options.min : DEFAULT_OPTIONS.min,
  plugins: options && options.plugins !== undefined ? options.plugins : DEFAULT_OPTIONS.plugins,
  printFunctionName: getPrintFunctionName(options),
  spacingInner: options && options.min ? ' ' : '\n',
  spacingOuter: options && options.min ? '' : '\n'
});

function createIndent(indent) {
  return ' '.repeat(indent);
}

function format(val, options) {
  if (options) {
    validateOptions(options);

    if (options.plugins) {
      const plugin = findPlugin(options.plugins, val);
      if (plugin !== null) {
        return printPlugin(plugin, val, getConfig(options), '', 0, []);
      }
    }
  }

  const basicResult = printBasicValue(val, getPrintFunctionName(options), getEscapeRegex(options), getEscapeString(options));
  if (basicResult !== null) {
    return basicResult;
  }

  return printComplexValue(val, getConfig(options), '', 0, []);
}

const plugins = {
  AsymmetricMatcher,
  ConvertAnsi,
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent
};

exports.plugins = plugins;
exports.default = format;

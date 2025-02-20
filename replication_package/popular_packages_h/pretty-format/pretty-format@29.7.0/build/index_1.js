'use strict';

Object.defineProperty(exports, '__esModule', { value: true });
exports.default = exports.DEFAULT_OPTIONS = void 0;
exports.format = format;
exports.plugins = void 0;

const _ansiStyles = require('ansi-styles'); // Import ANSI styles for highlighting
const _collections = require('./collections'); // Import supportive collection utilities
const _AsymmetricMatcher = require('./plugins/AsymmetricMatcher');
const _DOMCollection = require('./plugins/DOMCollection');
const _DOMElement = require('./plugins/DOMElement');
const _Immutable = require('./plugins/Immutable');
const _ReactElement = require('./plugins/ReactElement');
const _ReactTestComponent = require('./plugins/ReactTestComponent');

const toString = Object.prototype.toString;
const toISOString = Date.prototype.toISOString;
const errorToString = Error.prototype.toString;
const regExpToString = RegExp.prototype.toString;

const DEFAULT_THEME = {
  comment: 'gray',
  content: 'reset',
  prop: 'yellow',
  tag: 'cyan',
  value: 'green',
};
const DEFAULT_THEME_KEYS = Object.keys(DEFAULT_THEME);

const DEFAULT_OPTIONS = {
  callToJSON: true,
  compareKeys: undefined,
  escapeRegex: false,
  escapeString: true,
  highlight: false,
  indent: 2,
  maxDepth: Infinity,
  maxWidth: Infinity,
  min: false,
  plugins: [],
  printBasicPrototype: true,
  printFunctionName: true,
  theme: DEFAULT_THEME,
};
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

function getConstructorName(val) {
  return typeof val.constructor === 'function' && val.constructor.name || 'Object';
}

function isWindow(val) {
  return typeof window !== 'undefined' && val === window;
}

function PrettyFormatPluginError(message, stack) {
  this.message = message;
  this.stack = stack;
  this.name = this.constructor.name;
}
PrettyFormatPluginError.prototype = Object.create(Error.prototype);

function isToStringedArrayType(toStringed) {
  return (
    toStringed === '[object Array]' ||
    toStringed === '[object ArrayBuffer]' ||
    toStringed === '[object DataView]' ||
    toStringed === '[object Float32Array]' ||
    toStringed === '[object Float64Array]' ||
    toStringed === '[object Int8Array]' ||
    toStringed === '[object Int16Array]' ||
    toStringed === '[object Int32Array]' ||
    toStringed === '[object Uint8Array]' ||
    toStringed === '[object Uint8ClampedArray]' ||
    toStringed === '[object Uint16Array]' ||
    toStringed === '[object Uint32Array]'
  );
}

function printNumber(val) {
  return Object.is(val, -0) ? '-0' : String(val);
}

function printBigInt(val) {
  return String(`${val}n`);
}

function printFunction(val, printFunctionName) {
  return printFunctionName ? `[Function ${val.name || 'anonymous'}]` : '[Function]';
}

function printSymbol(val) {
  return String(val).replace(/^Symbol\((.*)\)(.*)$/, 'Symbol($1)');
}

function printError(val) {
  return `[${errorToString.call(val)}]`;
}

function printBasicValue(val, printFunctionName, escapeRegex, escapeString) {
  const typeOf = typeof val;
  switch (typeOf) {
    case 'boolean':
    case 'undefined':
    case 'symbol':
      return String(val);
    case 'number':
      return printNumber(val);
    case 'bigint':
      return printBigInt(val);
    case 'string':
      return escapeString ? `"${val.replace(/"|\\/g, '\\$&')}"` : `"${val}"`;
    case 'function':
      return printFunction(val, printFunctionName);
    case 'object':
      if (val === null) return 'null';
      const toStringed = toString.call(val);
      if (toStringed === '[object WeakMap]') return 'WeakMap {}';
      if (toStringed === '[object WeakSet]') return 'WeakSet {}';
      if (toStringed === '[object Date]') return isNaN(+val) ? 'Date { NaN }' : toISOString.call(val);
      if (toStringed === '[object Error]') return printError(val);
      if (toStringed === '[object RegExp]') return escapeRegex ? regExpToString.call(val).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&') : regExpToString.call(val);
      break;
  }
  return null;
}

function printComplexValue(val, config, indent, depth, refs, hasCalledToJSON) {
  if (refs.indexOf(val) !== -1) return '[Circular]';
  refs.push(val);
  const hitMaxDepth = ++depth > config.maxDepth;
  const min = config.min;
  
  if (config.callToJSON && !hitMaxDepth && val.toJSON && typeof val.toJSON === 'function' && !hasCalledToJSON) {
    return printer(val.toJSON(), config, indent, depth, refs, true);
  }

  const toStringed = toString.call(val);
  if (toStringed === '[object Arguments]') return hitMaxDepth ? '[Arguments]' : `${min ? '' : 'Arguments '}[${(0, _collections.printListItems)(val, config, indent, depth, refs, printer)}]`;
  if (isToStringedArrayType(toStringed)) return hitMaxDepth ? `[${val.constructor.name}]` : `${min ? '' : !config.printBasicPrototype && val.constructor.name === 'Array' ? '' : `${val.constructor.name} `}[${(0, _collections.printListItems)(val, config, indent, depth, refs, printer)}]`;
  if (toStringed === '[object Map]') return hitMaxDepth ? '[Map]' : `Map {${(0, _collections.printIteratorEntries)(val.entries(), config, indent, depth, refs, printer, ' => ')}}`;
  if (toStringed === '[object Set]') return hitMaxDepth ? '[Set]' : `Set {${(0, _collections.printIteratorValues)(val.values(), config, indent, depth, refs, printer)}}`;

  return hitMaxDepth || isWindow(val) ? `[${getConstructorName(val)}]` : `${min ? '' : !config.printBasicPrototype && getConstructorName(val) === 'Object' ? '' : `${getConstructorName(val)} `}{${(0, _collections.printObjectProperties)(val, config, indent, depth, refs, printer)}}`;
}

function isNewPlugin(plugin) {
  return plugin.serialize != null;
}

function printPlugin(plugin, val, config, indent, depth, refs) {
  let printed;
  try {
    printed = isNewPlugin(plugin)
      ? plugin.serialize(val, config, indent, depth, refs, printer)
      : plugin.print(
          val,
          valChild => printer(valChild, config, indent, depth, refs),
          str => `${indent + config.indent}${str.replace(/\n/gi, `\n${indent + config.indent}`)}`,
          { edgeSpacing: config.spacingOuter, min: config.min, spacing: config.spacingInner },
          config.colors,
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
  for (const plugin of plugins) {
    try {
      if (plugin.test(val)) return plugin;
    } catch (error) {
      throw new PrettyFormatPluginError(error.message, error.stack);
    }
  }
  return null;
}

function printer(val, config, indent, depth, refs, hasCalledToJSON) {
  const plugin = findPlugin(config.plugins, val);
  if (plugin) return printPlugin(plugin, val, config, indent, depth, refs);

  const basicResult = printBasicValue(val, config.printFunctionName, config.escapeRegex, config.escapeString);
  if (basicResult !== null) return basicResult;

  return printComplexValue(val, config, indent, depth, refs, hasCalledToJSON);
}

function validateOptions(options) {
  for (const key in options) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_OPTIONS, key)) throw new Error(`pretty-format: Unknown option "${key}".`);
  }
  if (options.min && options.indent !== undefined && options.indent !== 0) throw new Error('pretty-format: Options "min" and "indent" cannot be used together.');
  if (options.theme !== undefined) {
    if (options.theme === null) throw new Error('pretty-format: Option "theme" must not be null.');
    if (typeof options.theme !== 'object') throw new Error(`pretty-format: Option "theme" must be of type "object" but instead received "${typeof options.theme}".`);
  }
}

function getColorsHighlight(options) {
  return DEFAULT_THEME_KEYS.reduce((colors, key) => {
    const value = options.theme && options.theme[key] !== undefined ? options.theme[key] : DEFAULT_THEME[key];
    const color = value && _ansiStyles[value];
    if (color && typeof color.close === 'string' && typeof color.open === 'string') {
      colors[key] = color;
    } else {
      throw new Error(`pretty-format: Option "theme" has a key "${key}" whose value "${value}" is undefined in ansi-styles.`);
    }
    return colors;
  }, Object.create(null));
}

function getColorsEmpty() {
  return DEFAULT_THEME_KEYS.reduce((colors, key) => {
    colors[key] = { close: '', open: '' };
    return colors;
  }, Object.create(null));
}

function getPrintFunctionName(options) {
  return options?.printFunctionName ?? DEFAULT_OPTIONS.printFunctionName;
}

function getEscapeRegex(options) {
  return options?.escapeRegex ?? DEFAULT_OPTIONS.escapeRegex;
}

function getEscapeString(options) {
  return options?.escapeString ?? DEFAULT_OPTIONS.escapeString;
}

function getConfig(options) {
  return {
    callToJSON: options?.callToJSON ?? DEFAULT_OPTIONS.callToJSON,
    colors: options?.highlight ? getColorsHighlight(options) : getColorsEmpty(),
    compareKeys: typeof options?.compareKeys === 'function' || options?.compareKeys === null ? options.compareKeys : DEFAULT_OPTIONS.compareKeys,
    escapeRegex: getEscapeRegex(options),
    escapeString: getEscapeString(options),
    indent: options?.min ? '' : createIndent(options?.indent ?? DEFAULT_OPTIONS.indent),
    maxDepth: options?.maxDepth ?? DEFAULT_OPTIONS.maxDepth,
    maxWidth: options?.maxWidth ?? DEFAULT_OPTIONS.maxWidth,
    min: options?.min ?? DEFAULT_OPTIONS.min,
    plugins: options?.plugins ?? DEFAULT_OPTIONS.plugins,
    printBasicPrototype: options?.printBasicPrototype ?? true,
    printFunctionName: getPrintFunctionName(options),
    spacingInner: options?.min ? ' ' : '\n',
    spacingOuter: options?.min ? '' : '\n',
  };
}

function createIndent(indent) {
  return ' '.repeat(indent);
}

/**
 * Formats a JavaScript value based on specified options.
 *
 * @param {*} val - JavaScript value to format.
 * @param {Object} [options] - Formatting options.
 * @returns {String} The formatted string.
 */
function format(val, options) {
  if (options) {
    validateOptions(options);
    if (options.plugins) {
      const plugin = findPlugin(options.plugins, val);
      if (plugin) return printPlugin(plugin, val, getConfig(options), '', 0, []);
    }
  }

  const basicResult = printBasicValue(val, getPrintFunctionName(options), getEscapeRegex(options), getEscapeString(options));
  if (basicResult !== null) return basicResult;

  return printComplexValue(val, getConfig(options), '', 0, []);
}

const plugins = {
  AsymmetricMatcher: _AsymmetricMatcher,
  DOMCollection: _DOMCollection,
  DOMElement: _DOMElement,
  Immutable: _Immutable,
  ReactElement: _ReactElement,
  ReactTestComponent: _ReactTestComponent,
};

exports.plugins = plugins;
exports.default = format;

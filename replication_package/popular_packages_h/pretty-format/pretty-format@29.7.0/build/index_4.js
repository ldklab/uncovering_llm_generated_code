'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = exports.DEFAULT_OPTIONS = void 0;
exports.format = format;
exports.plugins = void 0;

var _ansiStyles = _interopRequireDefault(require('ansi-styles'));
var _collections = require('./collections');
var _AsymmetricMatcher = _interopRequireDefault(require('./plugins/AsymmetricMatcher'));
var _DOMCollection = _interopRequireDefault(require('./plugins/DOMCollection'));
var _DOMElement = _interopRequireDefault(require('./plugins/DOMElement'));
var _Immutable = _interopRequireDefault(require('./plugins/Immutable'));
var _ReactElement = _interopRequireDefault(require('./plugins/ReactElement'));
var _ReactTestComponent = _interopRequireDefault(require('./plugins/ReactTestComponent'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

const toString = Object.prototype.toString;
const toISOString = Date.prototype.toISOString;
const errorToString = Error.prototype.toString;
const regExpToString = RegExp.prototype.toString;

const getConstructorName = val => (typeof val.constructor === 'function' && val.constructor.name) || 'Object';
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
  return String(val).replace(SYMBOL_REGEXP, 'Symbol($1)');
}

function printError(val) {
  return `[${errorToString.call(val)}]`;
}

function printBasicValue(val, printFunctionName, escapeRegex, escapeString) {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  
  const typeOf = typeof val;
  if (typeOf === 'boolean' || typeOf === 'number') return String(val);
  if (typeOf === 'bigint') return printBigInt(val);
  if (typeOf === 'string') return escapeString ? `"${val.replace(/"|\\/g, '\\$&')}"` : `"${val}"`;
  if (typeOf === 'function') return printFunction(val, printFunctionName);
  if (typeOf === 'symbol') return printSymbol(val);

  const toStringed = toString.call(val);
  if (toStringed === '[object WeakMap]' || toStringed === '[object WeakSet]') return `${toStringed.slice(8, -1)} {}`;
  if (toStringed === '[object Date]') return isNaN(+val) ? 'Date { NaN }' : toISOString.call(val);
  if (toStringed === '[object Error]') return printError(val);
  if (toStringed === '[object RegExp]') return escapeRegex ? regExpToString.call(val).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&') : regExpToString.call(val);
  
  return null;
}

function printComplexValue(val, config, indentation, depth, refs, hasCalledToJSON) {
  if (refs.includes(val)) return '[Circular]';

  refs = [...refs, val];
  const hitMaxDepth = ++depth > config.maxDepth;

  if (config.callToJSON && !hitMaxDepth && val.toJSON && typeof val.toJSON === 'function' && !hasCalledToJSON) {
    return printer(val.toJSON(), config, indentation, depth, refs, true);
  }

  const toStringed = toString.call(val);
  if (toStringed === '[object Arguments]') {
    return hitMaxDepth ? '[Arguments]' : `${config.min ? '' : 'Arguments '}[${(0, _collections.printListItems)(val, config, indentation, depth, refs, printer)}]`;
  }
  if (isToStringedArrayType(toStringed)) {
    return hitMaxDepth
      ? `[${val.constructor.name}]`
      : `${config.min || (!config.printBasicPrototype && val.constructor.name === 'Array') ? '' : `${val.constructor.name} `}[${(0, _collections.printListItems)(val, config, indentation, depth, refs, printer)}]`;
  }
  if (toStringed === '[object Map]') {
    return hitMaxDepth
      ? '[Map]'
      : `Map {${(0, _collections.printIteratorEntries)(val.entries(), config, indentation, depth, refs, printer, ' => ')}}`;
  }
  if (toStringed === '[object Set]') {
    return hitMaxDepth
      ? '[Set]'
      : `Set {${(0, _collections.printIteratorValues)(val.values(), config, indentation, depth, refs, printer)}}`;
  }
  return hitMaxDepth || isWindow(val)
    ? `[${getConstructorName(val)}]`
    : `${config.min || (!config.printBasicPrototype && getConstructorName(val) === 'Object') ? '' : `${getConstructorName(val)} `}{${(0, _collections.printObjectProperties)(val, config, indentation, depth, refs, printer)}}`;
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
          str => {
            const indentationNext = indentation + config.indent;
            return indentationNext + str.replace(NEWLINE_REGEXP, `\n${indentationNext}`);
          },
          {
            edgeSpacing: config.spacingOuter,
            min: config.min,
            spacing: config.spacingInner
          },
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
  for (let p = 0; p < plugins.length; p++) {
    try {
      if (plugins[p].test(val)) {
        return plugins[p];
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

const toOptionsSubtype = options => options;

const DEFAULT_OPTIONS = toOptionsSubtype({
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
  theme: DEFAULT_THEME
});
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

function validateOptions(options) {
  Object.keys(options).forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_OPTIONS, key)) {
      throw new Error(`pretty-format: Unknown option "${key}".`);
    }
  });
  if (options.min && options.indent !== undefined && options.indent !== 0) {
    throw new Error('pretty-format: Options "min" and "indent" cannot be used together.');
  }
  if (options.theme !== undefined) {
    if (options.theme === null) {
      throw new Error('pretty-format: Option "theme" must not be null.');
    }
    if (typeof options.theme !== 'object') {
      throw new Error(`pretty-format: Option "theme" must be of type "object" but instead received "${typeof options.theme}".`);
    }
  }
}

const getColorsHighlight = options =>
  DEFAULT_THEME_KEYS.reduce((colors, key) => {
    const value = options.theme && options.theme[key] !== undefined ? options.theme[key] : DEFAULT_THEME[key];
    const color = value && _ansiStyles.default[value];
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

const getPrintFunctionName = options => options?.printFunctionName ?? DEFAULT_OPTIONS.printFunctionName;
const getEscapeRegex = options => options?.escapeRegex ?? DEFAULT_OPTIONS.escapeRegex;
const getEscapeString = options => options?.escapeString ?? DEFAULT_OPTIONS.escapeString;

const getConfig = options => ({
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
  spacingOuter: options?.min ? '' : '\n'
});

function createIndent(indent) {
  return new Array(indent + 1).join(' ');
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
  AsymmetricMatcher: _AsymmetricMatcher.default,
  DOMCollection: _DOMCollection.default,
  DOMElement: _DOMElement.default,
  Immutable: _Immutable.default,
  ReactElement: _ReactElement.default,
  ReactTestComponent: _ReactTestComponent.default
};

exports.plugins = plugins;
var _default = format;
exports.default = _default;

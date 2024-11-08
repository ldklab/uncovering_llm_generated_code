'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.format = format;
exports.default = exports.plugins = void 0;

const ansiStyles = require('ansi-styles').default;
const { printListItems, printIteratorEntries, printIteratorValues, printObjectProperties } = require('./collections');

const AsymmetricMatcher = require('./plugins/AsymmetricMatcher').default;
const ConvertAnsi = require('./plugins/ConvertAnsi').default;
const DOMCollection = require('./plugins/DOMCollection').default;
const DOMElement = require('./plugins/DOMElement').default;
const Immutable = require('./plugins/Immutable').default;
const ReactElement = require('./plugins/ReactElement').default;
const ReactTestComponent = require('./plugins/ReactTestComponent').default;

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

const getConstructorName = val =>
  (typeof val.constructor === 'function' && val.constructor.name) || 'Object';

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

function printNumber(val) {
  return Object.is(val, -0) ? '-0' : String(val);
}

function printBigInt(val) {
  return String(`${val}n`);
}

function printFunction(val, printFunctionName) {
  return printFunctionName ? '[Function ' + (val.name || 'anonymous') + ']' : '[Function]';
}

function printSymbol(val) {
  return String(val).replace(SYMBOL_REGEXP, 'Symbol($1)');
}

function printError(val) {
  return '[' + Error.prototype.toString.call(val) + ']';
}

function printBasicValue(val, printFunctionName, escapeRegex, escapeString) {
  if (val === true || val === false || val === null || val === undefined) {
    return String(val);
  }

  const typeOf = typeof val;

  if (typeOf === 'number') return printNumber(val);
  if (typeOf === 'bigint') return printBigInt(val);
  if (typeOf === 'string') {
    return '"' + (escapeString ? val.replace(/"|\\/g, '\\$&') : val) + '"';
  }
  if (typeOf === 'function') return printFunction(val, printFunctionName);
  if (typeOf === 'symbol') return printSymbol(val);

  const toStringed = Object.prototype.toString.call(val);

  switch (toStringed) {
    case '[object WeakMap]': return 'WeakMap {}';
    case '[object WeakSet]': return 'WeakSet {}';
    case '[object Date]': return isNaN(+val) ? 'Date { NaN }' : Date.prototype.toISOString.call(val);
    case '[object Error]': return printError(val);
    case '[object RegExp]':
      return escapeRegex
        ? RegExp.prototype.toString.call(val).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&')
        : RegExp.prototype.toString.call(val);
  }

  if (val instanceof Error) return printError(val);

  return null;
}

function printComplexValue(val, config, indentation, depth, refs, hasCalledToJSON) {
  if (refs.includes(val)) return '[Circular]';

  refs.push(val);
  const hitMaxDepth = ++depth > config.maxDepth;
  const min = config.min;

  if (
    config.callToJSON &&
    !hitMaxDepth &&
    val.toJSON &&
    typeof val.toJSON === 'function' &&
    !hasCalledToJSON
  ) {
    return printer(val.toJSON(), config, indentation, depth, refs, true);
  }

  const toStringed = Object.prototype.toString.call(val);

  switch (toStringed) {
    case '[object Arguments]':
      return printArguments(val, config, indentation, depth, refs, printer, hitMaxDepth, min);
    case '[object Array]':
    case '[object ArrayBuffer]':
    case '[object DataView]':
    case '[object Float32Array]':
    case '[object Float64Array]':
    case '[object Int8Array]':
    case '[object Int16Array]':
    case '[object Int32Array]':
    case '[object Uint8Array]':
    case '[object Uint8ClampedArray]':
    case '[object Uint16Array]':
    case '[object Uint32Array]':
      return printArrayBuffer(val, config, indentation, depth, refs, printer, hitMaxDepth, min);
    case '[object Map]':
      return printMap(val, config, indentation, depth, refs, printer, hitMaxDepth);
    case '[object Set]':
      return printSet(val, config, indentation, depth, refs, printer, hitMaxDepth);
  }

  if (hitMaxDepth || isWindow(val)) {
    return '[' + getConstructorName(val) + ']';
  }

  return (
    (min ? '' : getConstructorName(val) + ' ') +
    '{' +
    printObjectProperties(val, config, indentation, depth, refs, printer) +
    '}'
  );
}

function printArguments(val, config, indentation, depth, refs, printer, hitMaxDepth, min) {
  return hitMaxDepth
    ? '[Arguments]'
    : (min ? '' : 'Arguments ') +
      '[' +
      printListItems(val, config, indentation, depth, refs, printer) +
      ']';
}

function printArrayBuffer(val, config, indentation, depth, refs, printer, hitMaxDepth, min) {
  return hitMaxDepth
    ? '[' + val.constructor.name + ']'
    : (min ? '' : val.constructor.name + ' ') +
      '[' +
      printListItems(val, config, indentation, depth, refs, printer) +
      ']';
}

function printMap(val, config, indentation, depth, refs, printer, hitMaxDepth) {
  return hitMaxDepth
    ? '[Map]'
    : 'Map {' +
      printIteratorEntries(val.entries(), config, indentation, depth, refs, printer, ' => ') +
      '}';
}

function printSet(val, config, indentation, depth, refs, printer, hitMaxDepth) {
  return hitMaxDepth
    ? '[Set]'
    : 'Set {' +
      printIteratorValues(val.values(), config, indentation, depth, refs, printer) +
      '}';
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
            return indentationNext + str.replace(NEWLINE_REGEXP, '\n' + indentationNext);
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
    throw new Error(
      `pretty-format: Plugin must return type "string" but instead returned "${typeof printed}".`
    );
  }

  return printed;
}

function findPlugin(plugins, val) {
  for (let i = 0; i < plugins.length; i++) {
    try {
      if (plugins[i].test(val)) return plugins[i];
    } catch (error) {
      throw new PrettyFormatPluginError(error.message, error.stack);
    }
  }

  return null;
}

function printer(val, config, indentation, depth, refs, hasCalledToJSON) {
  const plugin = findPlugin(config.plugins, val);
  if (plugin !== null) return printPlugin(plugin, val, config, indentation, depth, refs);

  const basicResult = printBasicValue(val, config.printFunctionName, config.escapeRegex, config.escapeString);
  if (basicResult !== null) return basicResult;

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
    throw new Error(
      'pretty-format: Options "min" and "indent" cannot be used together.'
    );
  }

  if (options.theme !== undefined) {
    if (options.theme === null) {
      throw new Error(`pretty-format: Option "theme" must not be null.`);
    }

    if (typeof options.theme !== 'object') {
      throw new Error(
        `pretty-format: Option "theme" must be of type "object" but instead received "${typeof options.theme}".`
      );
    }
  }
}

const getColorsHighlight = options =>
  DEFAULT_THEME_KEYS.reduce((colors, key) => {
    const value =
      options.theme && options.theme[key] !== undefined
        ? options.theme[key]
        : DEFAULT_THEME[key];
    const color = value && ansiStyles[value];

    if (
      color &&
      typeof color.close === 'string' &&
      typeof color.open === 'string'
    ) {
      colors[key] = color;
    } else {
      throw new Error(
        `pretty-format: Option "theme" has a key "${key}" whose value "${value}" is undefined in ansi-styles.`
      );
    }

    return colors;
  }, Object.create(null));

const getColorsEmpty = () =>
  DEFAULT_THEME_KEYS.reduce((colors, key) => {
    colors[key] = {
      close: '',
      open: ''
    };
    return colors;
  }, Object.create(null));

const getPrintFunctionName = options =>
  options && options.printFunctionName !== undefined
    ? options.printFunctionName
    : DEFAULT_OPTIONS.printFunctionName;

const getEscapeRegex = options =>
  options && options.escapeRegex !== undefined
    ? options.escapeRegex
    : DEFAULT_OPTIONS.escapeRegex;

const getEscapeString = options =>
  options && options.escapeString !== undefined
    ? options.escapeString
    : DEFAULT_OPTIONS.escapeString;

const getConfig = options => ({
  callToJSON:
    options && options.callToJSON !== undefined
      ? options.callToJSON
      : DEFAULT_OPTIONS.callToJSON,
  colors:
    options && options.highlight
      ? getColorsHighlight(options)
      : getColorsEmpty(),
  escapeRegex: getEscapeRegex(options),
  escapeString: getEscapeString(options),
  indent:
    options && options.min
      ? ''
      : createIndent(
          options && options.indent !== undefined
            ? options.indent
            : DEFAULT_OPTIONS.indent
        ),
  maxDepth:
    options && options.maxDepth !== undefined
      ? options.maxDepth
      : DEFAULT_OPTIONS.maxDepth,
  min: options && options.min !== undefined ? options.min : DEFAULT_OPTIONS.min,
  plugins:
    options && options.plugins !== undefined
      ? options.plugins
      : DEFAULT_OPTIONS.plugins,
  printFunctionName: getPrintFunctionName(options),
  spacingInner: options && options.min ? ' ' : '\n',
  spacingOuter: options && options.min ? '' : '\n'
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

  const basicResult = printBasicValue(
    val,
    getPrintFunctionName(options),
    getEscapeRegex(options),
    getEscapeString(options)
  );

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
var _default = format;
exports.default = _default;

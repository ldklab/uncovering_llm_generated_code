'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
Object.defineProperty(exports, 'DIFF_DELETE', {
  enumerable: true,
  get: function () {
    return _cleanupSemantic.DIFF_DELETE;
  }
});
Object.defineProperty(exports, 'DIFF_EQUAL', {
  enumerable: true,
  get: function () {
    return _cleanupSemantic.DIFF_EQUAL;
  }
});
Object.defineProperty(exports, 'DIFF_INSERT', {
  enumerable: true,
  get: function () {
    return _cleanupSemantic.DIFF_INSERT;
  }
});
Object.defineProperty(exports, 'Diff', {
  enumerable: true,
  get: function () {
    return _cleanupSemantic.Diff;
  }
});
Object.defineProperty(exports, 'diffLinesRaw', {
  enumerable: true,
  get: function () {
    return _diffLines.diffLinesRaw;
  }
});
Object.defineProperty(exports, 'diffLinesUnified', {
  enumerable: true,
  get: function () {
    return _diffLines.diffLinesUnified;
  }
});
Object.defineProperty(exports, 'diffLinesUnified2', {
  enumerable: true,
  get: function () {
    return _diffLines.diffLinesUnified2;
  }
});
Object.defineProperty(exports, 'diffStringsRaw', {
  enumerable: true,
  get: function () {
    return _printDiffs.diffStringsRaw;
  }
});
Object.defineProperty(exports, 'diffStringsUnified', {
  enumerable: true,
  get: function () {
    return _printDiffs.diffStringsUnified;
  }
});
exports.default = void 0;

var _chalk = _interopRequireDefault(require('chalk'));

var _jestGetType = _interopRequireDefault(require('jest-get-type'));

var _prettyFormat = _interopRequireWildcard(require('pretty-format'));

var _cleanupSemantic = require('./cleanupSemantic');

var _constants = require('./constants');

var _diffLines = require('./diffLines');

var _normalizeDiffOptions = require('./normalizeDiffOptions');

var _printDiffs = require('./printDiffs');

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  var cache = new WeakMap();
  _getRequireWildcardCache = function () {
    return cache;
  };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

var Symbol = global['jest-symbol-do-not-touch'] || global.Symbol;

const getCommonMessage = (message, options) => {
  const {commonColor} = (0, _normalizeDiffOptions.normalizeDiffOptions)(
    options
  );
  return commonColor(message);
};

const {
  AsymmetricMatcher,
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent
} = _prettyFormat.plugins;
const PLUGINS = [
  ReactTestComponent,
  ReactElement,
  DOMElement,
  DOMCollection,
  Immutable,
  AsymmetricMatcher
];
const FORMAT_OPTIONS = {
  plugins: PLUGINS
};
const FORMAT_OPTIONS_0 = {...FORMAT_OPTIONS, indent: 0};
const FALLBACK_FORMAT_OPTIONS = {
  callToJSON: false,
  maxDepth: 10,
  plugins: PLUGINS
};
const FALLBACK_FORMAT_OPTIONS_0 = {...FALLBACK_FORMAT_OPTIONS, indent: 0}; // Generate a string that will highlight the difference between two values
// with green and red. (similar to how github does code diffing)
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types

function diff(a, b, options) {
  if (Object.is(a, b)) {
    return getCommonMessage(_constants.NO_DIFF_MESSAGE, options);
  }

  const aType = (0, _jestGetType.default)(a);
  let expectedType = aType;
  let omitDifference = false;

  if (aType === 'object' && typeof a.asymmetricMatch === 'function') {
    if (a.$$typeof !== Symbol.for('jest.asymmetricMatcher')) {
      // Do not know expected type of user-defined asymmetric matcher.
      return null;
    }

    if (typeof a.getExpectedType !== 'function') {
      // For example, expect.anything() matches either null or undefined
      return null;
    }

    expectedType = a.getExpectedType(); // Primitive types boolean and number omit difference below.
    // For example, omit difference for expect.stringMatching(regexp)

    omitDifference = expectedType === 'string';
  }

  if (expectedType !== (0, _jestGetType.default)(b)) {
    return (
      '  Comparing two different types of values.' +
      ` Expected ${_chalk.default.green(expectedType)} but ` +
      `received ${_chalk.default.red((0, _jestGetType.default)(b))}.`
    );
  }

  if (omitDifference) {
    return null;
  }

  switch (aType) {
    case 'string':
      return (0, _diffLines.diffLinesUnified)(
        a.split('\n'),
        b.split('\n'),
        options
      );

    case 'boolean':
    case 'number':
      return comparePrimitive(a, b, options);

    case 'map':
      return compareObjects(sortMap(a), sortMap(b), options);

    case 'set':
      return compareObjects(sortSet(a), sortSet(b), options);

    default:
      return compareObjects(a, b, options);
  }
}

function comparePrimitive(a, b, options) {
  const aFormat = (0, _prettyFormat.default)(a, FORMAT_OPTIONS);
  const bFormat = (0, _prettyFormat.default)(b, FORMAT_OPTIONS);
  return aFormat === bFormat
    ? getCommonMessage(_constants.NO_DIFF_MESSAGE, options)
    : (0, _diffLines.diffLinesUnified)(
        aFormat.split('\n'),
        bFormat.split('\n'),
        options
      );
}

function sortMap(map) {
  return new Map(Array.from(map.entries()).sort());
}

function sortSet(set) {
  return new Set(Array.from(set.values()).sort());
}

function compareObjects(a, b, options) {
  let difference;
  let hasThrown = false;
  const noDiffMessage = getCommonMessage(_constants.NO_DIFF_MESSAGE, options);

  try {
    const aCompare = (0, _prettyFormat.default)(a, FORMAT_OPTIONS_0);
    const bCompare = (0, _prettyFormat.default)(b, FORMAT_OPTIONS_0);

    if (aCompare === bCompare) {
      difference = noDiffMessage;
    } else {
      const aDisplay = (0, _prettyFormat.default)(a, FORMAT_OPTIONS);
      const bDisplay = (0, _prettyFormat.default)(b, FORMAT_OPTIONS);
      difference = (0, _diffLines.diffLinesUnified2)(
        aDisplay.split('\n'),
        bDisplay.split('\n'),
        aCompare.split('\n'),
        bCompare.split('\n'),
        options
      );
    }
  } catch {
    hasThrown = true;
  } // If the comparison yields no results, compare again but this time
  // without calling `toJSON`. It's also possible that toJSON might throw.

  if (difference === undefined || difference === noDiffMessage) {
    const aCompare = (0, _prettyFormat.default)(a, FALLBACK_FORMAT_OPTIONS_0);
    const bCompare = (0, _prettyFormat.default)(b, FALLBACK_FORMAT_OPTIONS_0);

    if (aCompare === bCompare) {
      difference = noDiffMessage;
    } else {
      const aDisplay = (0, _prettyFormat.default)(a, FALLBACK_FORMAT_OPTIONS);
      const bDisplay = (0, _prettyFormat.default)(b, FALLBACK_FORMAT_OPTIONS);
      difference = (0, _diffLines.diffLinesUnified2)(
        aDisplay.split('\n'),
        bDisplay.split('\n'),
        aCompare.split('\n'),
        bCompare.split('\n'),
        options
      );
    }

    if (difference !== noDiffMessage && !hasThrown) {
      difference =
        getCommonMessage(_constants.SIMILAR_MESSAGE, options) +
        '\n\n' +
        difference;
    }
  }

  return difference;
}

var _default = diff;
exports.default = _default;

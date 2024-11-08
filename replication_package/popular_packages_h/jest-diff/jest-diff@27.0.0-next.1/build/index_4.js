'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

const exportMapping = {
  DIFF_DELETE: () => _cleanupSemantic.DIFF_DELETE,
  DIFF_EQUAL: () => _cleanupSemantic.DIFF_EQUAL,
  DIFF_INSERT: () => _cleanupSemantic.DIFF_INSERT,
  Diff: () => _cleanupSemantic.Diff,
  diffLinesRaw: () => _diffLines.diffLinesRaw,
  diffLinesUnified: () => _diffLines.diffLinesUnified,
  diffLinesUnified2: () => _diffLines.diffLinesUnified2,
  diffStringsRaw: () => _printDiffs.diffStringsRaw,
  diffStringsUnified: () => _printDiffs.diffStringsUnified
};

for (const [key, accessor] of Object.entries(exportMapping)) {
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: accessor
  });
}

exports.default = void 0;

const _chalk = _interopRequireDefault(require('chalk'));
const _jestGetType = _interopRequireDefault(require('jest-get-type'));
const _prettyFormat = _interopRequireWildcard(require('pretty-format'));
const _cleanupSemantic = require('./cleanupSemantic');
const _constants = require('./constants');
const _diffLines = require('./diffLines');
const _normalizeDiffOptions = require('./normalizeDiffOptions');
const _printDiffs = require('./printDiffs');

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  const cache = new WeakMap();
  _getRequireWildcardCache = () => cache;
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  const cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  const newObj = {};
  const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
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

const Symbol = global['jest-symbol-do-not-touch'] || global.Symbol;

const getCommonMessage = (message, options) => {
  const {commonColor} = (0, _normalizeDiffOptions.normalizeDiffOptions)(options);
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
const FALLBACK_FORMAT_OPTIONS_0 = {...FALLBACK_FORMAT_OPTIONS, indent: 0};

function diff(a, b, options) {
  if (Object.is(a, b)) {
    return getCommonMessage(_constants.NO_DIFF_MESSAGE, options);
  }

  const aType = (0, _jestGetType.default)(a);
  let expectedType = aType;
  let omitDifference = false;

  if (aType === 'object' && typeof a.asymmetricMatch === 'function') {
    if (a.$$typeof !== Symbol.for('jest.asymmetricMatcher')) {
      return null;
    }

    if (typeof a.getExpectedType !== 'function') {
      return null;
    }

    expectedType = a.getExpectedType();
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
  }

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

const _default = diff;
exports.default = _default;

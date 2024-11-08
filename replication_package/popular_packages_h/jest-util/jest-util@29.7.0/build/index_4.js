'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const _ErrorWithStack = require('./ErrorWithStack').default;
const _clearLine = require('./clearLine').default;
const _createDirectory = require('./createDirectory').default;
const _deepCyclicCopy = require('./deepCyclicCopy').default;
const _convertDescriptorToString = require('./convertDescriptorToString').default;
const _formatTime = require('./formatTime').default;
const _globsToMatcher = require('./globsToMatcher').default;
const _installCommonGlobals = require('./installCommonGlobals').default;
const _interopRequireDefault = require('./interopRequireDefault').default;
const _isInteractive = require('./isInteractive').default;
const _isNonNullable = require('./isNonNullable').default;
const _isPromise = require('./isPromise').default;
const _pluralize = require('./pluralize').default;
const _replacePathSepForGlob = require('./replacePathSepForGlob').default;
const _requireOrImportModule = require('./requireOrImportModule').default;
const _setGlobal = require('./setGlobal').default;
const _testPathPatternToRegExp = require('./testPathPatternToRegExp').default;
const _tryRealpath = require('./tryRealpath').default;
const _invariant = require('./invariant').default;

exports.ErrorWithStack = _ErrorWithStack;
exports.clearLine = _clearLine;
exports.convertDescriptorToString = _convertDescriptorToString;
exports.createDirectory = _createDirectory;
exports.deepCyclicCopy = _deepCyclicCopy;
exports.formatTime = _formatTime;
exports.globsToMatcher = _globsToMatcher;
exports.installCommonGlobals = _installCommonGlobals;
exports.interopRequireDefault = _interopRequireDefault;
exports.invariant = _invariant;
exports.isInteractive = _isInteractive;
exports.isNonNullable = _isNonNullable;
exports.isPromise = _isPromise;
exports.pluralize = _pluralize;
exports.replacePathSepForGlob = _replacePathSepForGlob;
exports.requireOrImportModule = _requireOrImportModule;
exports.setGlobal = _setGlobal;
exports.testPathPatternToRegExp = _testPathPatternToRegExp;
exports.tryRealpath = _tryRealpath;

const preRunMessage = require('./preRunMessage');
exports.preRunMessage = preRunMessage;

const specialChars = require('./specialChars');
exports.specialChars = specialChars;

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== 'function') return null;
  const cacheBabelInterop = new WeakMap();
  const cacheNodeInterop = new WeakMap();
  return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return { default: obj };
  }
  const cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  const newObj = {};
  const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (const key in obj) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(obj, key)) {
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

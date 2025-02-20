'use strict';

const matcherUtils = _interopRequireWildcard(require('jest-matcher-utils'));
const _asymmetricMatchers = require('./asymmetricMatchers');
const _extractExpectedAssertionsErrors = _interopRequireDefault(require('./extractExpectedAssertionsErrors'));
const _jasmineUtils = require('./jasmineUtils');
const _jestMatchersObject = require('./jestMatchersObject');
const _matchers = _interopRequireDefault(require('./matchers'));
const _spyMatchers = _interopRequireDefault(require('./spyMatchers'));
const _toThrowMatchers = _interopRequireWildcard(require('./toThrowMatchers'));
const _utils = require('./utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _getRequireWildcardCache() {
  if (typeof WeakMap !== 'function') return null;
  const cache = new WeakMap();
  _getRequireWildcardCache = function () { return cache; };
  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return { default: obj };
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

const Symbol = global['jest-symbol-do-not-touch'] || global.Symbol;
const Promise = global[Symbol.for('jest-native-promise')] || global.Promise;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value, enumerable: true, configurable: true, writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

class JestAssertionError extends Error {
  constructor(...args) {
    super(...args);
    _defineProperty(this, 'matcherResult', void 0);
  }
}

const isPromise = (obj) => !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';

const createToThrowErrorMatchingSnapshotMatcher = (matcher) => (received, testNameOrInlineSnapshot) => 
  matcher.apply(this, [received, testNameOrInlineSnapshot, true]);

const getPromiseMatcher = (name, matcher) => {
  if (name === 'toThrow' || name === 'toThrowError') {
    return (0, _toThrowMatchers.createMatcher)(name, true);
  } else if (name === 'toThrowErrorMatchingSnapshot' || name === 'toThrowErrorMatchingInlineSnapshot') {
    return createToThrowErrorMatchingSnapshotMatcher(matcher);
  }
  return null;
};

const expect = (actual, ...rest) => {
  if (rest.length !== 0) {
    throw new Error('Expect takes at most one argument.');
  }

  const allMatchers = (0, _jestMatchersObject.getMatchers)();
  const expectation = {
    not: {},
    rejects: { not: {} },
    resolves: { not: {} }
  };

  Object.keys(allMatchers).forEach(name => {
    const matcher = allMatchers[name];
    const promiseMatcher = getPromiseMatcher(name, matcher) || matcher;
    expectation[name] = makeThrowingMatcher(matcher, false, '', actual);
    expectation.not[name] = makeThrowingMatcher(matcher, true, '', actual);
    expectation.resolves[name] = makeResolveMatcher(name, promiseMatcher, false, actual);
    expectation.resolves.not[name] = makeResolveMatcher(name, promiseMatcher, true, actual);
    expectation.rejects[name] = makeRejectMatcher(name, promiseMatcher, false, actual);
    expectation.rejects.not[name] = makeRejectMatcher(name, promiseMatcher, true, actual);
  });
  return expectation;
};

const makeResolveMatcher = (matcherName, matcher, isNot, actual) => (...args) => {
  if (!isPromise(actual)) {
    throw new JestAssertionError(matcherUtils.matcherErrorMessage(
      matcherUtils.matcherHint(matcherName, undefined, '', { isNot, promise: 'resolves' }),
      `${matcherUtils.RECEIVED_COLOR('received')} value must be a promise`,
      matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
    ));
  }
  
  return actual.then(result => {
    makeThrowingMatcher(matcher, isNot, 'resolves', result).apply(null, args);
  }, reason => {
    const error = new JestAssertionError();
    error.message = matcherUtils.matcherHint(matcherName, undefined, '', { isNot, promise: 'resolves' }) +
      '\n\n' +
      `Received promise rejected instead of resolved\n` +
      `Rejected to value: ${matcherUtils.printReceived(reason)}`;
    return Promise.reject(error);
  });
};

const makeRejectMatcher = (matcherName, matcher, isNot, actual) => (...args) => {
  const actualWrapper = typeof actual === 'function' ? actual() : actual;
  
  if (!isPromise(actualWrapper)) {
    throw new JestAssertionError(matcherUtils.matcherErrorMessage(
      matcherUtils.matcherHint(matcherName, undefined, '', { isNot, promise: 'rejects' }),
      `${matcherUtils.RECEIVED_COLOR('received')} value must be a promise or a function returning a promise`,
      matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
    ));
  }
  
  return actualWrapper.then(
    result => {
      const error = new JestAssertionError();
      error.message = matcherUtils.matcherHint(matcherName, undefined, '', { isNot, promise: 'rejects' }) +
        '\n\n' +
        `Received promise resolved instead of rejected\n` +
        `Resolved to value: ${matcherUtils.printReceived(result)}`;
      return Promise.reject(error);
    },
    reason => {
      makeThrowingMatcher(matcher, isNot, 'rejects', reason).apply(null, args);
    }
  );
};

const makeThrowingMatcher = (matcher, isNot, promise, actual) =>
  function throwingMatcher(...args) {
    let throws = true;
    const matcherContext = {
      dontThrow: () => (throws = false),
      error: new JestAssertionError(),
      isNot,
      promise,
      utils: {
        ...matcherUtils,
        iterableEquality: _utils.iterableEquality,
        subsetEquality: _utils.subsetEquality
      }
    };

    try {
      const result = matcher.call(matcherContext, actual, ...args);
      return processMatcherResult(result, throws);
    } catch (error) {
      handleMatcherError(error, matcher);
    }
  };

function processMatcherResult(result, throws) {
  _validateResult(result);
  if ((result.pass && matcherContext.isNot) || (!result.pass && !matcherContext.isNot)) {
    const error = new JestAssertionError(getMessage(result.message));
    if (throws) {
      throw error;
    } else {
      matcherContext.suppressedErrors.push(error);
    }
  }
}

function handleMatcherError(error, matcher) {
  if (matcher[_jestMatchersObject.INTERNAL_MATCHER_FLAG] &&
    !(error instanceof JestAssertionError) &&
    error.name !== 'PrettyFormatPluginError') {
    Error.captureStackTrace(error, throwingMatcher);
  }
  throw error;
}

function getMessage(message) {
  return (message && message()) ||
    matcherUtils.RECEIVED_COLOR('No message was specified for this matcher.');
}

expect.extend = matchers => (0, _jestMatchersObject.setMatchers)(matchers, false, expect);

expect.anything = _asymmetricMatchers.anything;
expect.any = _asymmetricMatchers.any;
expect.not = {
  arrayContaining: _asymmetricMatchers.arrayNotContaining,
  objectContaining: _asymmetricMatchers.objectNotContaining,
  stringContaining: _asymmetricMatchers.stringNotContaining,
  stringMatching: _asymmetricMatchers.stringNotMatching
};
expect.objectContaining = _asymmetricMatchers.objectContaining;
expect.arrayContaining = _asymmetricMatchers.arrayContaining;
expect.stringContaining = _asymmetricMatchers.stringContaining;
expect.stringMatching = _asymmetricMatchers.stringMatching;

function _validateResult(result) {
  if (typeof result !== 'object' || typeof result.pass !== 'boolean' ||
    (result.message && typeof result.message !== 'string' && typeof result.message !== 'function')) {
    throw new Error(
      'Unexpected return from a matcher function.\n' +
      'Matcher functions should return an object in the following format:\n' +
      '  {message?: string | function, pass: boolean}\n' +
      `'${matcherUtils.stringify(result)}' was returned`
    );
  }
}

function assertions(expected) {
  const error = new Error();
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, assertions);
  }
  _jestMatchersObject.getState().expectedAssertionsNumber = expected;
  _jestMatchersObject.getState().expectedAssertionsNumberError = error;
}

function hasAssertions(...args) {
  const error = new Error();
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, hasAssertions);
  }
  matcherUtils.ensureNoExpected(args[0], '.hasAssertions');
  _jestMatchersObject.getState().isExpectingAssertions = true;
  _jestMatchersObject.getState().isExpectingAssertionsError = error;
}

(0, _jestMatchersObject.setMatchers)(_matchers.default, true, expect);
(0, _jestMatchersObject.setMatchers)(_spyMatchers.default, true, expect);
(0, _jestMatchersObject.setMatchers)(_toThrowMatchers.default, true, expect);

expect.addSnapshotSerializer = () => void 0;
expect.assertions = assertions;
expect.hasAssertions = hasAssertions;
expect.getState = _jestMatchersObject.getState;
expect.setState = _jestMatchersObject.setState;
expect.extractExpectedAssertionsErrors = _extractExpectedAssertionsErrors.default;
module.exports = expect;

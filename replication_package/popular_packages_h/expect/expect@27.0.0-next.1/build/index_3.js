'use strict';

const matcherUtils = require('jest-matcher-utils');
const {
  anything,
  any,
  arrayContaining,
  objectContaining,
  stringContaining,
  stringMatching,
  arrayNotContaining,
  objectNotContaining,
  stringNotContaining,
  stringNotMatching
} = require('./asymmetricMatchers');
const extractExpectedAssertionsErrors = require('./extractExpectedAssertionsErrors').default;
const {
  getMatchers,
  getState,
  setMatchers,
  INTERNAL_MATCHER_FLAG
} = require('./jestMatchersObject');
const defaultMatchers = require('./matchers').default;
const spyMatchers = require('./spyMatchers').default;
const { createMatcher } = require('./toThrowMatchers');
const { iterableEquality, subsetEquality } = require('./utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) return obj;
  const newObj = {};
  if (obj != null) {
    Object.keys(obj).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const desc = Object.getOwnPropertyDescriptor(obj, key);
        Object.defineProperty(newObj, key, desc || {});
      }
    });
  }
  newObj.default = obj;
  return newObj;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

class JestAssertionError extends Error {
  constructor(...args) {
    super(...args);
    _defineProperty(this, 'matcherResult', undefined);
  }
}

const globalSymbol = global['jest-symbol-do-not-touch'] || global.Symbol;
const Promise = global[globalSymbol.for('jest-native-promise')] || global.Promise;

const isPromise = obj => !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';

const createToThrowErrorMatchingSnapshotMatcher = matcher => (received, testNameOrInlineSnapshot) =>
  matcher.call(this, received, testNameOrInlineSnapshot, true);

const getPromiseMatcher = (name, matcher) => {
  return name === 'toThrow' || name === 'toThrowError'
    ? createMatcher(name, true)
    : (name === 'toThrowErrorMatchingSnapshot' || name === 'toThrowErrorMatchingInlineSnapshot')
    ? createToThrowErrorMatchingSnapshotMatcher(matcher)
    : null;
};

const expect = (actual, ...rest) => {
  if (rest.length !== 0) {
    throw new Error('Expect takes at most one argument.');
  }

  const allMatchers = getMatchers();
  const expectation = {
    not: {},
    rejects: { not: {} },
    resolves: { not: {} }
  };

  const err = new JestAssertionError();
  Object.keys(allMatchers).forEach(name => {
    const matcher = allMatchers[name];
    const promiseMatcher = getPromiseMatcher(name, matcher) || matcher;
    expectation[name] = makeThrowingMatcher(matcher, false, '', actual);
    expectation.not[name] = makeThrowingMatcher(matcher, true, '', actual);
    expectation.resolves[name] = makeResolveMatcher(name, promiseMatcher, false, actual, err);
    expectation.resolves.not[name] = makeResolveMatcher(name, promiseMatcher, true, actual, err);
    expectation.rejects[name] = makeRejectMatcher(name, promiseMatcher, false, actual, err);
    expectation.rejects.not[name] = makeRejectMatcher(name, promiseMatcher, true, actual, err);
  });

  return expectation;
};

const getMessage = message => (message && message()) || matcherUtils.RECEIVED_COLOR('No message was specified for this matcher.');

const makeResolveMatcher = (matcherName, matcher, isNot, actual, outerErr) => (...args) => {
  const options = { isNot, promise: 'resolves' };
  if (!isPromise(actual)) {
    throw new JestAssertionError(
      matcherUtils.matcherErrorMessage(
        matcherUtils.matcherHint(matcherName, undefined, '', options),
        `${matcherUtils.RECEIVED_COLOR('received')} value must be a promise`,
        matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
      )
    );
  }
  const innerErr = new JestAssertionError();
  return actual.then(
    result => makeThrowingMatcher(matcher, isNot, 'resolves', result, innerErr).apply(null, args),
    reason => {
      outerErr.message = `${matcherUtils.matcherHint(matcherName, undefined, '', options)}\n\nReceived promise rejected instead of resolved\nRejected to value: ${matcherUtils.printReceived(reason)}`;
      return Promise.reject(outerErr);
    }
  );
};

const makeRejectMatcher = (matcherName, matcher, isNot, actual, outerErr) => (...args) => {
  const options = { isNot, promise: 'rejects' };
  const actualWrapper = typeof actual === 'function' ? actual() : actual;
  if (!isPromise(actualWrapper)) {
    throw new JestAssertionError(
      matcherUtils.matcherErrorMessage(
        matcherUtils.matcherHint(matcherName, undefined, '', options),
        `${matcherUtils.RECEIVED_COLOR('received')} value must be a promise or a function returning a promise`,
        matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
      )
    );
  }
  const innerErr = new JestAssertionError();
  return actualWrapper.then(
    result => {
      outerErr.message = `${matcherUtils.matcherHint(matcherName, undefined, '', options)}\n\nReceived promise resolved instead of rejected\nResolved to value: ${matcherUtils.printReceived(result)}`;
      return Promise.reject(outerErr);
    },
    reason => makeThrowingMatcher(matcher, isNot, 'rejects', reason, innerErr).apply(null, args)
  );
};

const makeThrowingMatcher = (matcher, isNot, promise, actual, err) => function throwingMatcher(...args) {
  let throws = true;
  const utils = { ...matcherUtils, iterableEquality, subsetEquality };
  const matcherContext = {
    dontThrow: () => (throws = false),
    ...getState(),
    equals: matcherUtils.equals,
    error: err,
    isNot,
    promise,
    utils
  };

  const processResult = (result, asyncError) => {
    _validateResult(result);
    getState().assertionCalls++;
    if ((result.pass && isNot) || (!result.pass && !isNot)) {
      const message = getMessage(result.message);
      const error = err || new JestAssertionError(message);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(error, throwingMatcher);
      }
      error.matcherResult = result;
      if (throws) throw error;
      getState().suppressedErrors.push(error);
    }
  };

  const handleError = error => {
    if (matcher[INTERNAL_MATCHER_FLAG] === true && !(error instanceof JestAssertionError) && error.name !== 'PrettyFormatPluginError' && Error.captureStackTrace) {
      Error.captureStackTrace(error, throwingMatcher);
    }
    throw error;
  };

  let potentialResult;
  try {
    potentialResult = matcher[INTERNAL_MATCHER_FLAG] === true
      ? matcher.call(matcherContext, actual, ...args)
      : (function __EXTERNAL_MATCHER_TRAP__() {
          return matcher.call(matcherContext, actual, ...args);
        })();

    if (isPromise(potentialResult)) {
      const asyncResult = potentialResult;
      const asyncError = new JestAssertionError();
      if (Error.captureStackTrace) {
        Error.captureStackTrace(asyncError, throwingMatcher);
      }
      return asyncResult.then(aResult => processResult(aResult, asyncError)).catch(handleError);
    } else {
      return processResult(potentialResult);
    }
  } catch (error) {
    return handleError(error);
  }
};

expect.extend = matchers => setMatchers(matchers, false, expect);
expect.anything = anything;
expect.any = any;
expect.not = {
  arrayContaining: arrayNotContaining,
  objectContaining: objectNotContaining,
  stringContaining: stringNotContaining,
  stringMatching: stringNotMatching
};
expect.objectContaining = objectContaining;
expect.arrayContaining = arrayContaining;
expect.stringContaining = stringContaining;
expect.stringMatching = stringMatching;

const _validateResult = result => {
  if (typeof result !== 'object' || typeof result.pass !== 'boolean' || (result.message && typeof result.message !== 'string' && typeof result.message !== 'function')) {
    throw new Error(
      'Unexpected return from a matcher function.\n' +
      'Matcher functions should return an object in the following format:\n' +
      '  {message?: string | function, pass: boolean}\n' +
      `'${matcherUtils.stringify(result)}' was returned`
    );
  }
};

function assertions(expected) {
  const error = new Error();
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, assertions);
  }
  getState().expectedAssertionsNumber = expected;
  getState().expectedAssertionsNumberError = error;
}

function hasAssertions(...args) {
  const error = new Error();
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, hasAssertions);
  }
  matcherUtils.ensureNoExpected(args[0], '.hasAssertions');
  getState().isExpectingAssertions = true;
  getState().isExpectingAssertionsError = error;
}

setMatchers(defaultMatchers, true, expect);
setMatchers(spyMatchers, true, expect);
setMatchers(require('./toThrowMatchers').default, true, expect);

expect.addSnapshotSerializer = () => void 0;
expect.assertions = assertions;
expect.hasAssertions = hasAssertions;
expect.getState = getState;
expect.setState = setState;
expect.extractExpectedAssertionsErrors = extractExpectedAssertionsErrors;

module.exports = expect;

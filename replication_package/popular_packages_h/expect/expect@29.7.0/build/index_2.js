'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
Object.defineProperty(exports, 'AsymmetricMatcher', {
  enumerable: true,
  get: function () {
    return AsymmetricMatcher;
  }
});
exports.expect = exports.default = exports.JestAssertionError = void 0;

const { iterableEquality, subsetEquality, equals } = require('@jest/expect-utils');
const matcherUtils = require('jest-matcher-utils');
const { isPromise } = require('jest-util');
const { AsymmetricMatcher, anything, any, arrayContaining, closeTo, objectContaining, stringContaining, stringMatching, arrayNotContaining, notCloseTo, objectNotContaining, stringNotContaining, stringNotMatching } = require('./asymmetricMatchers');
const extractExpectedAssertionsErrors = require('./extractExpectedAssertionsErrors').default;
const { getState, setState, getMatchers, setMatchers, getCustomEqualityTesters, INTERNAL_MATCHER_FLAG } = require('./jestMatchersObject');
const matchers = require('./matchers').default;
const spyMatchers = require('./spyMatchers').default;
const { createMatcher: createToThrowMatcher, default: toThrowMatchersDefault } = require('./toThrowMatchers');

let Symbol = globalThis['jest-symbol-do-not-touch'] || globalThis.Symbol;
let Promise = globalThis[Symbol.for('jest-native-promise')] || globalThis.Promise;

class JestAssertionError extends Error {
  constructor(message) {
    super(message);
    this.matcherResult = undefined;
  }
}
exports.JestAssertionError = JestAssertionError;

const createToThrowErrorMatchingSnapshotMatcher = function (matcher) {
  return function (received, testNameOrInlineSnapshot) {
    return matcher.apply(this, [received, testNameOrInlineSnapshot, true]);
  };
};

const getPromiseMatcher = (name, matcher) => {
  if (name === 'toThrow' || name === 'toThrowError') {
    return createToThrowMatcher(name, true);
  } else if (name === 'toThrowErrorMatchingSnapshot' || name === 'toThrowErrorMatchingInlineSnapshot') {
    return createToThrowErrorMatchingSnapshotMatcher(matcher);
  }
  return null;
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
exports.expect = expect;

const getMessage = message => (message && message()) || matcherUtils.RECEIVED_COLOR('No message was specified for this matcher.');

const makeResolveMatcher = (matcherName, matcher, isNot, actual, outerErr) => (...args) => {
  const options = { isNot, promise: 'resolves' };
  if (!isPromise(actual)) {
    throw createAssertionError(matcherName, matcherUtils.RECEIVED_COLOR('received') + ' value must be a promise', actual, options);
  }
  const innerErr = new JestAssertionError();
  return actual.then(
    result => makeThrowingMatcher(matcher, isNot, 'resolves', result, innerErr).apply(null, args),
    reason => handleRejection(outerErr, matcherName, options, reason)
  );
};

const makeRejectMatcher = (matcherName, matcher, isNot, actual, outerErr) => (...args) => {
  const options = { isNot, promise: 'rejects' };
  const actualWrapper = typeof actual === 'function' ? actual() : actual;
  if (!isPromise(actualWrapper)) {
    throw createAssertionError(matcherName, matcherUtils.RECEIVED_COLOR('received') + ' value must be a promise or a function returning a promise', actual, options);
  }
  const innerErr = new JestAssertionError();
  return actualWrapper.then(
    result => handleUnexpectedResolve(outerErr, matcherName, options, result),
    reason => makeThrowingMatcher(matcher, isNot, 'rejects', reason, innerErr).apply(null, args)
  );
};

const makeThrowingMatcher = (matcher, isNot, promise, actual, err) => function throwingMatcher(...args) {
  const utils = { ...matcherUtils, iterableEquality, subsetEquality };
  const matcherContext = { ...getState(), error: err, isNot, promise, utils, customTesters: getCustomEqualityTesters(), dontThrow: () => (throws = false), equals };
  
  let throws = true;
  try {
    const result = runMatcher(matcher, matcherContext, args);
    return processResult(result);
  } catch (error) {
    return handleError(error);
  }

  function processResult(result) {
    validateResult(result);
    getState().assertionCalls++;
    
    if ((result.pass && isNot) || (!result.pass && !isNot)) {
      const message = getMessage(result.message);
      const error = createError(message, err);
      error.matcherResult = { ...result, message };
      if (throws) throw error;
      getState().suppressedErrors.push(error);
    } else {
      getState().numPassingAsserts++;
    }
  }

  function handleError(error) {
    if (!isInternalError(error) && Error.captureStackTrace) {
      Error.captureStackTrace(error, throwingMatcher);
    }
    throw error;
  }
};

function assertions(expected) {
  const error = new Error();
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, assertions);
  }
  setState({ expectedAssertionsNumber: expected, expectedAssertionsNumberError: error });
}

function hasAssertions(...args) {
  const error = new Error();
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, hasAssertions);
  }
  matcherUtils.ensureNoExpected(args[0], '.hasAssertions');
  setState({ isExpectingAssertions: true, isExpectingAssertionsError: error });
}

function createAssertionError(matcherName, message, actual, options) {
  return new JestAssertionError(matcherUtils.matcherErrorMessage(matcherUtils.matcherHint(matcherName, undefined, '', options), message, matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)));
}

function handleRejection(outerErr, matcherName, options, reason) {
  outerErr.message = `${matcherUtils.matcherHint(matcherName, undefined, '', options)}\n\nReceived promise rejected instead of resolved\nRejected to value: ${matcherUtils.printReceived(reason)}`;
  return Promise.reject(outerErr);
}

function handleUnexpectedResolve(outerErr, matcherName, options, result) {
  outerErr.message = `${matcherUtils.matcherHint(matcherName, undefined, '', options)}\n\nReceived promise resolved instead of rejected\nResolved to value: ${matcherUtils.printReceived(result)}`;
  return Promise.reject(outerErr);
}

function isInternalError(error) {
  return error instanceof JestAssertionError || error.name === 'PrettyFormatPluginError';
}

function createError(message, err) {
  const error = err || new JestAssertionError(message);
  if (!err && Error.captureStackTrace) {
    Error.captureStackTrace(error, throwingMatcher);
  }
  return error;
}

function validateResult(result) {
  if (typeof result !== 'object' || typeof result.pass !== 'boolean' || (result.message && typeof result.message !== 'string' && typeof result.message !== 'function')) {
    throw new Error(`Unexpected return from a matcher function.\nMatcher functions should return an object in the following format: {message?: string | function, pass: boolean}\n'${matcherUtils.stringify(result)}' was returned`);
  }
}

expect.extend = matchers => setMatchers(matchers, false, expect);
expect.addEqualityTesters = customTesters => addCustomEqualityTesters(customTesters);
expect.anything = anything;
expect.any = any;
expect.not = { arrayContaining: arrayNotContaining, closeTo: notCloseTo, objectContaining: objectNotContaining, stringContaining: stringNotContaining, stringMatching: stringNotMatching };
expect.arrayContaining = arrayContaining;
expect.closeTo = closeTo;
expect.objectContaining = objectContaining;
expect.stringContaining = stringContaining;
expect.stringMatching = stringMatching;
expect.assertions = assertions;
expect.hasAssertions = hasAssertions;
expect.getState = getState;
expect.setState = setState;
expect.extractExpectedAssertionsErrors = extractExpectedAssertionsErrors;

setMatchers(matchers, true, expect);
setMatchers(spyMatchers, true, expect);
setMatchers(toThrowMatchersDefault, true, expect);

exports.default = expect;

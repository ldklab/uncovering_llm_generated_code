'use strict';

const { iterableEquality, subsetEquality, equals } = require('@jest/expect-utils');
const matcherUtils = require('jest-matcher-utils');
const { isPromise, ensureNoExpected } = require('jest-util');
const {
  getMatchers,
  setMatchers,
  getCustomEqualityTesters,
  getState,
  setState,
  addCustomEqualityTesters,
  INTERNAL_MATCHER_FLAG
} = require('./jestMatchersObject');
const { AsymmetricMatcher, anything, any, arrayNotContaining, notCloseTo, objectNotContaining, stringNotContaining, stringNotMatching,
  arrayContaining, closeTo, objectContaining, stringContaining, stringMatching } = require('./asymmetricMatchers');
const extractExpectedAssertionsErrors = require('./extractExpectedAssertionsErrors');
const matchers = require('./matchers').default;
const spyMatchers = require('./spyMatchers').default;
const { createMatcher, default: toThrowMatchers } = require('./toThrowMatchers');

class JestAssertionError extends Error {
  matcherResult;
}

function createToThrowErrorMatchingSnapshotMatcher(matcher) {
  return (received, testNameOrInlineSnapshot) =>
    matcher(received, testNameOrInlineSnapshot, true);
}

function getPromiseMatcher(name, matcher) {
  switch (name) {
    case 'toThrow':
    case 'toThrowError':
      return createMatcher(name, true);
    case 'toThrowErrorMatchingSnapshot':
    case 'toThrowErrorMatchingInlineSnapshot':
      return createToThrowErrorMatchingSnapshotMatcher(matcher);
    default:
      return null;
  }
}

const makeResolveMatcher = (matcherName, matcher, isNot, actual, outerErr) => (...args) => {
  const options = { isNot, promise: 'resolves' };
  if (!isPromise(actual)) {
    throw new JestAssertionError(
      matcherUtils.matcherErrorMessage(
        matcherUtils.matcherHint(matcherName, undefined, '', options),
        `Received value must be a promise`,
        matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
      )
    );
  }
  const innerErr = new JestAssertionError();
  return actual.then(
    result => makeThrowingMatcher(matcher, isNot, 'resolves', result, innerErr)(...args),
    reason => {
      outerErr.message = `${matcherUtils.matcherHint(matcherName, undefined, '', options)}\n\n` +
        'Received promise rejected instead of resolved\n' +
        `Rejected to value: ${matcherUtils.printReceived(reason)}`;
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
        `Received value must be a promise or a function returning a promise`,
        matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
      )
    );
  }
  const innerErr = new JestAssertionError();
  return actualWrapper.then(
    result => {
      outerErr.message = `${matcherUtils.matcherHint(matcherName, undefined, '', options)}\n\n` +
        'Received promise resolved instead of rejected\n' +
        `Resolved to value: ${matcherUtils.printReceived(result)}`;
      return Promise.reject(outerErr);
    },
    reason => makeThrowingMatcher(matcher, isNot, 'rejects', reason, innerErr)(...args)
  );
};

const makeThrowingMatcher = (matcher, isNot, promise, actual, err) =>
  function throwingMatcher(...args) {
    let throws = true;
    const utils = { ...matcherUtils, iterableEquality, subsetEquality };
    const matcherUtilsThing = {
      customTesters: getCustomEqualityTesters(),
      dontThrow: () => (throws = false),
      equals,
      utils
    };
    const matcherContext = {
      ...getState(),
      ...matcherUtilsThing,
      error: err,
      isNot,
      promise
    };
    const processResult = (result, asyncError) => {
      validateResult(result);
      getState().assertionCalls++;
      if ((result.pass && isNot) || (!result.pass && !isNot)) {
        const message = result.message?.() ?? matcherUtils.RECEIVED_COLOR('No message specified for this matcher.');
        const error = err || asyncError || new JestAssertionError(message);

        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, throwingMatcher);
        }
        error.matcherResult = { ...result, message };
        if (throws) throw error;
        else getState().suppressedErrors.push(error);
      } else {
        getState().numPassingAsserts++;
      }
    };
    const handleError = error => {
      if (
        matcher[INTERNAL_MATCHER_FLAG] &&
        !(error instanceof JestAssertionError) &&
        error.name !== 'PrettyFormatPluginError' &&
        Error.captureStackTrace
      ) {
        Error.captureStackTrace(error, throwingMatcher);
      }
      throw error;
    };
    let potentialResult;
    try {
      potentialResult = matcher[INTERNAL_MATCHER_FLAG] ? matcher.call(matcherContext, actual, ...args) : matcher.call(matcherContext, actual, ...args);
      if (isPromise(potentialResult)) {
        const asyncError = new JestAssertionError();
        if (Error.captureStackTrace) {
          Error.captureStackTrace(asyncError, throwingMatcher);
        }
        return potentialResult.then(result => processResult(result, asyncError)).catch(handleError);
      } else {
        return processResult(potentialResult);
      }
    } catch (error) {
      return handleError(error);
    }
  };

const validateResult = result => {
  if (
    typeof result !== 'object' ||
    typeof result.pass !== 'boolean' ||
    (result.message && typeof result.message !== 'string' && typeof result.message !== 'function')
  ) {
    throw new Error(
      'Matcher functions should return an object in the format: {message?: string | function, pass: boolean}. ' +
      `'${matcherUtils.stringify(result)}' was returned.`
    );
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
  ensureNoExpected(args[0], '.hasAssertions');
  setState({ isExpectingAssertions: true, isExpectingAssertionsError: error });
}

const expect = (actual, ...rest) => {
  if (rest.length !== 0) throw new Error('Expect takes at most one argument.');
  const allMatchers = getMatchers();
  const expectation = {
    not: {},
    resolves: { not: {} },
    rejects: { not: {} }
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

expect.extend = matchers => setMatchers(matchers, false, expect);
expect.addEqualityTesters = addCustomEqualityTesters;
expect.anything = anything;
expect.any = any;
expect.not = {
  arrayContaining: arrayNotContaining,
  closeTo: notCloseTo,
  objectContaining: objectNotContaining,
  stringContaining: stringNotContaining,
  stringMatching: stringNotMatching
};
expect.arrayContaining = arrayContaining;
expect.closeTo = closeTo;
expect.objectContaining = objectContaining;
expect.stringContaining = stringContaining;
expect.stringMatching = stringMatching;

// Initialize default jest matchers
setMatchers(matchers, true, expect);
setMatchers(spyMatchers, true, expect);
setMatchers(toThrowMatchers, true, expect);

expect.assertions = assertions;
expect.hasAssertions = hasAssertions;
expect.getState = getState;
expect.setState = setState;
expect.extractExpectedAssertionsErrors = extractExpectedAssertionsErrors.default;

module.exports = expect;

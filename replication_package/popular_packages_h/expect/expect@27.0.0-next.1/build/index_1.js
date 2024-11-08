'use strict';

const matcherUtils = require('jest-matcher-utils');
const { anything, any, arrayContaining, objectContaining, stringContaining, stringMatching, arrayNotContaining, objectNotContaining, stringNotContaining, stringNotMatching } = require('./asymmetricMatchers');
const extractExpectedAssertionsErrors = require('./extractExpectedAssertionsErrors').default;
const { getState, setState, getMatchers, setMatchers, INTERNAL_MATCHER_FLAG, ensureNoExpected } = require('./jestMatchersObject');
const matchers = require('./matchers').default;
const spyMatchers = require('./spyMatchers').default;
const { createMatcher } = require('./toThrowMatchers');
const toThrowMatchers = require('./toThrowMatchers');
const { iterableEquality, subsetEquality, stringify, matcherErrorMessage, matcherHint, printWithType, RECEIVED_COLOR } = matcherUtils;
const { equals } = require('./jasmineUtils');

class JestAssertionError extends Error {
  constructor(...args) {
    super(...args);
    this.matcherResult = undefined;
  }
}

function isPromise(obj) {
  return obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
}

function createToThrowErrorMatchingSnapshotMatcher(matcher) {
  return (received, testNameOrInlineSnapshot) =>
    matcher.apply(this, [received, testNameOrInlineSnapshot, true]);
}

function getPromiseMatcher(name, matcher) {
  if (name === 'toThrow' || name === 'toThrowError') {
    return createMatcher(name, true);
  } else if (['toThrowErrorMatchingSnapshot', 'toThrowErrorMatchingInlineSnapshot'].includes(name)) {
    return createToThrowErrorMatchingSnapshotMatcher(matcher);
  }
  return null;
}

function expect(actual, ...rest) {
  if (rest.length !== 0) {
    throw new Error('Expect takes at most one argument.');
  }

  const allMatchers = getMatchers();
  const expectation = {
    not: {},
    rejects: { not: {} },
    resolves: { not: {} },
  };
  const err = new JestAssertionError();
  
  for (const name in allMatchers) {
    const matcher = allMatchers[name];
    const promiseMatcher = getPromiseMatcher(name, matcher) || matcher;

    expectation[name] = makeThrowingMatcher(matcher, false, '', actual);
    expectation.not[name] = makeThrowingMatcher(matcher, true, '', actual);
    expectation.resolves[name] = makeResolveMatcher(name, promiseMatcher, false, actual, err);
    expectation.resolves.not[name] = makeResolveMatcher(name, promiseMatcher, true, actual, err);
    expectation.rejects[name] = makeRejectMatcher(name, promiseMatcher, false, actual, err);
    expectation.rejects.not[name] = makeRejectMatcher(name, promiseMatcher, true, actual, err);
  }
  
  return expectation;
}

function getMessage(message) {
  return (message && message()) || RECEIVED_COLOR('No message was specified for this matcher.');
}

function makeResolveMatcher(matcherName, matcher, isNot, actual, outerErr) {
  return (...args) => {
    const options = { isNot, promise: 'resolves' };

    if (!isPromise(actual)) {
      throw new JestAssertionError(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, '', options),
          `${RECEIVED_COLOR('received')} value must be a promise`,
          printWithType('Received', actual, printReceived)
        )
      );
    }

    const innerErr = new JestAssertionError();
    return actual.then(
      result => makeThrowingMatcher(matcher, isNot, 'resolves', result, innerErr).apply(null, args),
      reason => {
        outerErr.message = matcherHint(matcherName, undefined, '', options) + '\n\n' +
          `Received promise rejected instead of resolved\n` +
          `Rejected value: ${printReceived(reason)}`;
        return Promise.reject(outerErr);
      }
    );
  };
}

function makeRejectMatcher(matcherName, matcher, isNot, actual, outerErr) {
  return (...args) => {
    const options = { isNot, promise: 'rejects' };
    const actualWrapper = typeof actual === 'function' ? actual() : actual;

    if (!isPromise(actualWrapper)) {
      throw new JestAssertionError(
        matcherErrorMessage(
          matcherHint(matcherName, undefined, '', options),
          `${RECEIVED_COLOR('received')} value must be a promise or a function returning a promise`,
          printWithType('Received', actual, printReceived)
        )
      );
    }

    const innerErr = new JestAssertionError();
    return actualWrapper.then(
      result => {
        outerErr.message = matcherHint(matcherName, undefined, '', options) + '\n\n' +
          `Received promise resolved instead of rejected\n` +
          `Resolved value: ${printReceived(result)}`;
        return Promise.reject(outerErr);
      },
      reason => makeThrowingMatcher(matcher, isNot, 'rejects', reason, innerErr).apply(null, args)
    );
  };
}

function makeThrowingMatcher(matcher, isNot, promise, actual, err) {
  return function throwingMatcher(...args) {
    let throws = true;
    const utils = { ...matcherUtils, iterableEquality, subsetEquality };
    const matcherContext = {
      dontThrow: () => (throws = false),
      ...(getState()),
      equals,
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
        let error = err ? Object.assign(err, { message }) : asyncError;
        error = error || new JestAssertionError(message);
        
        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, throwingMatcher);
        }
        error.matcherResult = result;

        if (throws) {
          throw error;
        } else {
          getState().suppressedErrors.push(error);
        }
      }
    };

    const handleError = error => {
      if (matcher[INTERNAL_MATCHER_FLAG] === true && !(error instanceof JestAssertionError) &&
        error.name !== 'PrettyFormatPluginError' && Error.captureStackTrace) {
        Error.captureStackTrace(error, throwingMatcher);
      }

      throw error;
    };

    let potentialResult;
    try {
      potentialResult = matcher[INTERNAL_MATCHER_FLAG] === true
        ? matcher.call(matcherContext, actual, ...args)
        : function __EXTERNAL_MATCHER_TRAP__() {
          return matcher.call(matcherContext, actual, ...args);
        }();

      if (isPromise(potentialResult)) {
        const asyncResult = potentialResult;
        const asyncError = new JestAssertionError();

        if (Error.captureStackTrace) {
          Error.captureStackTrace(asyncError, throwingMatcher);
        }

        return asyncResult
          .then(aResult => processResult(aResult, asyncError))
          .catch(handleError);
      } else {
        const syncResult = potentialResult;
        return processResult(syncResult);
      }
    } catch (error) {
      return handleError(error);
    }
  };
}

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

function _validateResult(result) {
  if (typeof result !== 'object' || typeof result.pass !== 'boolean' ||
      (result.message && typeof result.message !== 'string' && typeof result.message !== 'function')) {
    throw new Error(
      'Unexpected return from a matcher function.\n' +
      'Matcher functions should return an object in the following format:\n' +
      '  {message?: string | function, pass: boolean}\n' +
      `'${stringify(result)}' was returned`
    );
  }
}

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
  ensureNoExpected(args[0], '.hasAssertions');
  getState().isExpectingAssertions = true;
  getState().isExpectingAssertionsError = error;
}

setMatchers(matchers, true, expect);
setMatchers(spyMatchers, true, expect);
setMatchers(toThrowMatchers.default, true, expect);

expect.addSnapshotSerializer = () => void 0;

expect.assertions = assertions;
expect.hasAssertions = hasAssertions;
expect.getState = getState;
expect.setState = setState;
expect.extractExpectedAssertionsErrors = extractExpectedAssertionsErrors;

module.exports = expect;

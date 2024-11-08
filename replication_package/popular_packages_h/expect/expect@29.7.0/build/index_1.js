'use strict';

import { iterableEquality, subsetEquality, equals } from '@jest/expect-utils';
import * as matcherUtils from 'jest-matcher-utils';
import { isPromise } from 'jest-util';
import { getMatchers, setMatchers, getState, setState, getCustomEqualityTesters, INTERNAL_MATCHER_FLAG } from './jestMatchersObject';
import asymmetricMatchers, { anything, any, arrayContaining, objectContaining, stringContaining, stringMatching, arrayNotContaining, notCloseTo, objectNotContaining, stringNotContaining, stringNotMatching } from './asymmetricMatchers';
import extractExpectedAssertionsErrors from './extractExpectedAssertionsErrors';
import matchers from './matchers';
import spyMatchers from './spyMatchers';
import * as toThrowMatchers from './toThrowMatchers';

class JestAssertionError extends Error {
  matcherResult;
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function _interopRequireWildcard(obj) {
  if (!obj) return {};
  if (obj.__esModule) return obj;
  const newObj = {};
  for (let key in obj) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(obj, key)) {
      newObj[key] = obj[key];
    }
  }
  newObj.default = obj;
  return newObj;
}

const Symbol = globalThis['jest-symbol-do-not-touch'] || globalThis.Symbol;
const Promise = globalThis[Symbol.for('jest-native-promise')] || globalThis.Promise;

const getMessage = message => message?.() || matcherUtils.RECEIVED_COLOR('No message was specified for this matcher.');

const getPromiseMatcher = (name, matcher) => {
  switch (name) {
    case 'toThrow':
    case 'toThrowError':
      return toThrowMatchers.createMatcher(name, true);
    case 'toThrowErrorMatchingSnapshot':
    case 'toThrowErrorMatchingInlineSnapshot':
      return createToThrowErrorMatchingSnapshotMatcher(matcher);
    default:
      return null;
  }
};

const makeResolveMatcher = (matcherName, matcher, isNot, actual, outerErr) => (...args) => {
  if (!isPromise(actual)) {
    throw buildAssertionError(matcherName, actual, 'resolves', isNot, 'promise');
  }
  const err = new JestAssertionError();
  return actual
    .then(result => makeThrowingMatcher(matcher, isNot, 'resolves', result, err).apply(null, args))
    .catch(reason => Promise.reject(buildRejectionError(matcherName, reason, outerErr)));
};

const makeRejectMatcher = (matcherName, matcher, isNot, actual, outerErr) => (...args) => {
  const actualWrapper = typeof actual === 'function' ? actual() : actual;
  if (!isPromise(actualWrapper)) {
    throw buildAssertionError(matcherName, actual, 'rejects', isNot, 'promise or a function returning a promise');
  }
  const err = new JestAssertionError();
  return actualWrapper
    .then(result => Promise.reject(buildResolutionError(matcherName, result, outerErr)))
    .catch(reason => makeThrowingMatcher(matcher, isNot, 'rejects', reason, err).apply(null, args));
};

const makeThrowingMatcher = (matcher, isNot, promise, actual, err) => function throwingMatcher(...args) {
  let throws = true;
  const matcherContext = {
    ...getState(),
    ...initializeMatcherUtils(),
    error: err,
    isNot,
    promise
  };
  
  try {
    const result = matcher[INTERNAL_MATCHER_FLAG] === true
      ? matcher.call(matcherContext, actual, ...args)
      : (function __EXTERNAL_MATCHER_TRAP__() {
          return matcher.call(matcherContext, actual, ...args);
        })();
        
    return processResult(result, throws, matcher, matcherContext, args);
  } catch (error) {
    handleError(error, matcher);
  }
};

function expect(actual, ...rest) {
  if (rest.length !== 0) {
    throw new Error('Expect takes at most one argument.');
  }
  
  const allMatchers = getMatchers();
  const err = new JestAssertionError();
  const expectation = {
    not: {},
    resolves: { not: {} },
    rejects: { not: {} }
  };

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
}

function createToThrowErrorMatchingSnapshotMatcher(matcher) {
  return function (received, testNameOrInlineSnapshot) {
    return matcher.apply(this, [received, testNameOrInlineSnapshot, true]);
  };
}

expect.extend = matchers => setMatchers(matchers, false, expect);
expect.addEqualityTesters = customTesters => addCustomEqualityTesters(customTesters);
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
expect.closeTo = notCloseTo;
expect.objectContaining = objectContaining;
expect.stringContaining = stringContaining;
expect.stringMatching = stringMatching;

function assertions(expected) {
  const error = new Error();
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, assertions);
  }
  setState({
    expectedAssertionsNumber: expected,
    expectedAssertionsNumberError: error
  });
}

function hasAssertions(...args) {
  const error = new Error();
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, hasAssertions);
  }
  matcherUtils.ensureNoExpected(args[0], '.hasAssertions');
  setState({
    isExpectingAssertions: true,
    isExpectingAssertionsError: error
  });
}

const _validateResult = result => {
  if (typeof result !== 'object' || typeof result.pass !== 'boolean' || !isStringOrFunction(result.message)) {
    throw new Error(
      'Unexpected return from a matcher function.\n' +
        'Matcher functions should return an object in the following format:\n' +
        '  {message?: string | function, pass: boolean}\n' +
        `'${matcherUtils.stringify(result)}' was returned`
    );
  }
};

function buildAssertionError(matcherName, actual, promiseType, isNot, expectedType) {
  const options = { isNot, promise: promiseType };
  const errorMessage = matcherUtils.matcherErrorMessage(
    matcherUtils.matcherHint(matcherName, undefined, '', options),
    `${matcherUtils.RECEIVED_COLOR('received')} value must be a ${expectedType}`,
    matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
  );
  return new JestAssertionError(errorMessage);
}

function buildRejectionError(matcherName, reason, outerErr) {
  const message =
    `${matcherUtils.matcherHint(matcherName, undefined, '', { isNot: false, promise: 'resolves' })}\n\n` +
    'Received promise rejected instead of resolved\n' +
    `Rejected to value: ${matcherUtils.printReceived(reason)}`;
  outerErr.message = message;
  return outerErr;
}

function buildResolutionError(matcherName, result, outerErr) {
  const message =
    `${matcherUtils.matcherHint(matcherName, undefined, '', { isNot: false, promise: 'rejects' })}\n\n` +
    'Received promise resolved instead of rejected\n' +
    `Resolved to value: ${matcherUtils.printReceived(result)}`;
  outerErr.message = message;
  return outerErr;
}

function isStringOrFunction(value) {
  return typeof value === 'string' || typeof value === 'function';
}

function processResult(result, throws, matcher, matcherContext, args) {
  let potentialResult;
  const asyncError = new JestAssertionError();
  if ((0, _jestUtil.isPromise)(potentialResult)) {
    if (Error.captureStackTrace) {
      Error.captureStackTrace(asyncError, throwingMatcher);
    }
    return potentialResult
      .then(aResult => validateAndProcessResult(aResult, matcher, matcherContext, asyncError, throws, args))
      .catch(handleError);
  } else {
    return validateAndProcessResult(potentialResult, matcher, matcherContext, asyncError, throws, args);
  }
}

function validateAndProcessResult(result, matcher, matcherContext, asyncError, throws, args) {
  _validateResult(result);
  const state = getState();
  state.assertionCalls++;
  if ((result.pass && matcherContext.isNot) || (!result.pass && !matcherContext.isNot)) {
    const message = getMessage(result.message);
    const error = new JestAssertionError(message);
    error.matcherResult = { ...result, message };

    if (throws) {
      throw error;
    } else {
      state.suppressedErrors.push(error);
    }
  } else {
    state.numPassingAsserts++;
  }
}

function handleError(error, matcher) {
  if (matcher[INTERNAL_MATCHER_FLAG] === true && !(error instanceof JestAssertionError) && error.name !== 'PrettyFormatPluginError' && Error.captureStackTrace) {
    Error.captureStackTrace(error, throwingMatcher);
  }
  throw error;
}

function initializeMatcherUtils() {
  return {
    ...matcherUtils,
    iterableEquality,
    subsetEquality,
    equals,
    customTesters: getCustomEqualityTesters(),
    dontThrow: () => (throws = false),
    utils: matcherUtils
  };
}

expect.assertions = assertions;
expect.hasAssertions = hasAssertions;
expect.getState = getState;
expect.setState = setState;
expect.extractExpectedAssertionsErrors = extractExpectedAssertionsErrors;
export default expect;
export { expect, JestAssertionError, asymmetricMatchers.AsymmetricMatcher as AsymmetricMatcher };

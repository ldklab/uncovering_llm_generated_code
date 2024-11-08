'use strict';

const matcherUtils = require('jest-matcher-utils');
const asymmetricMatchers = require('./asymmetricMatchers');
const extractExpectedAssertionsErrors = require('./extractExpectedAssertionsErrors').default;
const jasmineUtils = require('./jasmineUtils');
const jestMatchersObject = require('./jestMatchersObject');
const matchers = require('./matchers').default;
const spyMatchers = require('./spyMatchers').default;
const toThrowMatchers = require('./toThrowMatchers');
const utils = require('./utils');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) return obj;
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) return {default: obj};
  const cache = new WeakMap();
  if (cache && cache.has(obj)) return cache.get(obj);
  const newObj = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const desc = Object.getOwnPropertyDescriptor(obj, key);
      if (desc.get || desc.set) Object.defineProperty(newObj, key, desc);
      else newObj[key] = obj[key];
    }
  }
  newObj.default = obj;
  cache && cache.set(obj, newObj);
  return newObj;
}

const Symbol = global['jest-symbol-do-not-touch'] || global.Symbol;
const Promise = global[Symbol.for('jest-native-promise')] || global.Promise;

class JestAssertionError extends Error {
  constructor(...args) {
    super(...args);
    this.matcherResult = undefined;
  }
}

const isPromise = obj => obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';

const createToThrowErrorMatchingSnapshotMatcher = matcher => (received, testNameOrInlineSnapshot) => {
  return matcher.call(this, received, testNameOrInlineSnapshot, true);
};

const getPromiseMatcher = (name, matcher) => {
  if (name === 'toThrow' || name === 'toThrowError') return toThrowMatchers.createMatcher(name, true);
  else if (name === 'toThrowErrorMatchingSnapshot' || name === 'toThrowErrorMatchingInlineSnapshot') {
    return createToThrowErrorMatchingSnapshotMatcher(matcher);
  }
  return null;
};

const expect = (actual, ...rest) => {
  if (rest.length !== 0) throw new Error('Expect takes at most one argument.');

  const allMatchers = jestMatchersObject.getMatchers();
  const expectation = { not: {}, resolves: { not: {} }, rejects: { not: {} } };
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
    throw new JestAssertionError(matcherUtils.matcherErrorMessage(
      matcherUtils.matcherHint(matcherName, undefined, '', options), 
      `${matcherUtils.RECEIVED_COLOR('received')} value must be a promise`,
      matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
    ));
  }

  const innerErr = new JestAssertionError();
  return actual.then(
    result => makeThrowingMatcher(matcher, isNot, 'resolves', result, innerErr).apply(null, args),
    reason => {
      outerErr.message = matcherUtils.matcherHint(matcherName, undefined, '', options) + '\n\n'
        + `Received promise rejected instead of resolved\n`
        + `Rejected to value: ${matcherUtils.printReceived(reason)}`;
      return Promise.reject(outerErr);
    }
  );
};

const makeRejectMatcher = (matcherName, matcher, isNot, actual, outerErr) => (...args) => {
  const options = { isNot, promise: 'rejects' };
  const actualWrapper = typeof actual === 'function' ? actual() : actual;

  if (!isPromise(actualWrapper)) {
    throw new JestAssertionError(matcherUtils.matcherErrorMessage(
      matcherUtils.matcherHint(matcherName, undefined, '', options), 
      `${matcherUtils.RECEIVED_COLOR('received')} value must be a promise or a function returning a promise`,
      matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
    ));
  }

  const innerErr = new JestAssertionError();
  return actualWrapper.then(
    result => {
      outerErr.message = matcherUtils.matcherHint(matcherName, undefined, '', options) + '\n\n'
        + `Received promise resolved instead of rejected\n`
        + `Resolved to value: ${matcherUtils.printReceived(result)}`;
      return Promise.reject(outerErr);
    },
    reason => makeThrowingMatcher(matcher, isNot, 'rejects', reason, innerErr).apply(null, args)
  );
};

const makeThrowingMatcher = (matcher, isNot, promise, actual, err) => function(...args) {
  const utils = {
    ...matcherUtils,
    iterableEquality: utils.iterableEquality,
    subsetEquality: utils.subsetEquality,
  };

  const matcherContext = {
    dontThrow: () => throws = false,
    ...jestMatchersObject.getState(),
    equals: jasmineUtils.equals,
    error: err,
    isNot,
    promise,
    utils,
  };

  const processResult = (result, asyncError) => {
    _validateResult(result);
    jestMatchersObject.getState().assertionCalls++;

    if ((result.pass && isNot) || (!result.pass && !isNot)) {
      const message = getMessage(result.message);
      let error = err || new JestAssertionError(message);
      if (!err && asyncError) {
        error = asyncError;
        error.message = message;
      }
      error.matcherResult = result;

      if (throws) throw error;
      jestMatchersObject.getState().suppressedErrors.push(error);
    }
  };

  const handleError = error => {
    if (matcher[jestMatchersObject.INTERNAL_MATCHER_FLAG] && 
        error.name !== 'PrettyFormatPluginError' && Error.captureStackTrace) {
      Error.captureStackTrace(error, makeThrowingMatcher);
    }
    throw error;
  };

  let potentialResult;
  try {
    potentialResult = matcher[jestMatchersObject.INTERNAL_MATCHER_FLAG]
      ? matcher.call(matcherContext, actual, ...args)
      : (() => matcher.call(matcherContext, actual, ...args))();

    if (isPromise(potentialResult)) {
      const asyncResult = potentialResult;
      const asyncError = new JestAssertionError();
      if (Error.captureStackTrace) Error.captureStackTrace(asyncError, makeThrowingMatcher);
      return asyncResult.then(
        aResult => processResult(aResult, asyncError),
        handleError
      );
    } else {
      return processResult(potentialResult);
    }
  } catch (error) {
    return handleError(error);
  }
};

expect.extend = matchers => jestMatchersObject.setMatchers(matchers, false, expect);
expect.anything = asymmetricMatchers.anything;
expect.any = asymmetricMatchers.any;
expect.not = {
  arrayContaining: asymmetricMatchers.arrayNotContaining,
  objectContaining: asymmetricMatchers.objectNotContaining,
  stringContaining: asymmetricMatchers.stringNotContaining,
  stringMatching: asymmetricMatchers.stringNotMatching,
};
expect.objectContaining = asymmetricMatchers.objectContaining;
expect.arrayContaining = asymmetricMatchers.arrayContaining;
expect.stringContaining = asymmetricMatchers.stringContaining;
expect.stringMatching = asymmetricMatchers.stringMatching;

const _validateResult = result => {
  if (typeof result !== 'object' || typeof result.pass !== 'boolean' ||
      (result.message && typeof result.message !== 'string' && typeof result.message !== 'function')) {
    throw new Error(
      'Unexpected return from a matcher function.\n' +
      'Matcher functions should return an object in the following format:\n' +
      '{message?: string | function, pass: boolean}\n' +
      `'${matcherUtils.stringify(result)}' was returned`
    );
  }
};

function assertions(expected) {
  const error = new Error();
  if (Error.captureStackTrace) Error.captureStackTrace(error, assertions);
  jestMatchersObject.getState().expectedAssertionsNumber = expected;
  jestMatchersObject.getState().expectedAssertionsNumberError = error;
}

function hasAssertions(...args) {
  const error = new Error();
  if (Error.captureStackTrace) Error.captureStackTrace(error, hasAssertions);
  matcherUtils.ensureNoExpected(args[0], '.hasAssertions');
  jestMatchersObject.getState().isExpectingAssertions = true;
  jestMatchersObject.getState().isExpectingAssertionsError = error;
}

jestMatchersObject.setMatchers(matchers, true, expect);
jestMatchersObject.setMatchers(spyMatchers, true, expect);
jestMatchersObject.setMatchers(toThrowMatchers.default, true, expect);

expect.addSnapshotSerializer = () => void 0;
expect.assertions = assertions;
expect.hasAssertions = hasAssertions;
expect.getState = jestMatchersObject.getState;
expect.setState = jestMatchersObject.setState;
expect.extractExpectedAssertionsErrors = extractExpectedAssertionsErrors;
module.exports = expect;

'use strict';

import { iterableEquality, subsetEquality, equals } from '@jest/expect-utils';
import * as matcherUtils from 'jest-matcher-utils';
import { isPromise } from 'jest-util';
import { AsymmetricMatcher, anything, any, arrayContaining, closeTo, objectContaining, stringContaining, stringMatching, arrayNotContaining, notCloseTo, objectNotContaining, stringNotContaining, stringNotMatching } from './asymmetricMatchers';
import extractExpectedAssertionsErrors from './extractExpectedAssertionsErrors';
import { getMatchers, getState, setState, INTERNAL_MATCHER_FLAG, setMatchers, getCustomEqualityTesters, addCustomEqualityTesters } from './jestMatchersObject';
import defaultMatchers from './matchers';
import spyMatchers from './spyMatchers';
import { createMatcher as createToThrowMatcher, default as toThrowMatchers } from './toThrowMatchers';

class JestAssertionError extends Error {
  matcherResult;
}

const Symbol = globalThis['jest-symbol-do-not-touch'] || globalThis.Symbol;
const Promise = globalThis[Symbol.for('jest-native-promise')] || globalThis.Promise;

const createToThrowErrorMatchingSnapshotMatcher = matcher => (received, testNameOrInlineSnapshot) =>
  matcher.apply(this, [received, testNameOrInlineSnapshot, true]);

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

const getMessage = message => message && message() || matcherUtils.RECEIVED_COLOR('No message was specified for this matcher.');

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
    throw new JestAssertionError(matcherUtils.matcherErrorMessage(
      matcherUtils.matcherHint(matcherName, undefined, '', options),
      `${matcherUtils.RECEIVED_COLOR('received')} value must be a promise or a function returning a promise`,
      matcherUtils.printWithType('Received', actual, matcherUtils.printReceived)
    ));
  }

  const innerErr = new JestAssertionError();
  
  return actualWrapper.then(
    result => {
      outerErr.message = `${matcherUtils.matcherHint(matcherName, undefined, '', options)}\n\n` +
        'Received promise resolved instead of rejected\n' +
        `Resolved to value: ${matcherUtils.printReceived(result)}`;
      return Promise.reject(outerErr);
    },
    reason => makeThrowingMatcher(matcher, isNot, 'rejects', reason, innerErr).apply(null, args)
  );
};

const makeThrowingMatcher = (matcher, isNot, promise, actual, err) => function throwingMatcher(...args) {
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
    _validateResult(result);
    getState().assertionCalls++;
    
    if ((result.pass && isNot) || (!result.pass && !isNot)) {
      const message = getMessage(result.message);
      let error;
      
      if (err) {
        error = err;
        error.message = message;
      } else if (asyncError) {
        error = asyncError;
        error.message = message;
      } else {
        error = new JestAssertionError(message);

        if (Error.captureStackTrace) {
          Error.captureStackTrace(error, throwingMatcher);
        }
      }

      error.matcherResult = { ...result, message };

      if (throws) {
        throw error;
      } else {
        getState().suppressedErrors.push(error);
      }
    } else {
      getState().numPassingAsserts++;
    }
  };

  const handleError = error => {
    if (matcher[INTERNAL_MATCHER_FLAG] === true &&
      !(error instanceof JestAssertionError) &&
      error.name !== 'PrettyFormatPluginError' &&
      Error.captureStackTrace) {
        Error.captureStackTrace(error, throwingMatcher);
    }
    throw error;
  };

  try {
    const potentialResult = matcher[INTERNAL_MATCHER_FLAG] === true ?
      matcher.call(matcherContext, actual, ...args) :
      (function __EXTERNAL_MATCHER_TRAP__() {
        return matcher.call(matcherContext, actual, ...args);
      })();

    if (isPromise(potentialResult)) {
      const asyncError = new JestAssertionError();
      if (Error.captureStackTrace) {
        Error.captureStackTrace(asyncError, throwingMatcher);
      }

      return potentialResult
        .then(aResult => processResult(aResult, asyncError))
        .catch(handleError);
    } else {
      return processResult(potentialResult);
    }
  } catch (error) {
    return handleError(error);
  }
};

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
expect.closeTo = closeTo;
expect.objectContaining = objectContaining;
expect.stringContaining = stringContaining;
expect.stringMatching = stringMatching;
expect.assertions = assertions;
expect.hasAssertions = hasAssertions;
expect.getState = getState;
expect.setState = setState;
expect.extractExpectedAssertionsErrors = extractExpectedAssertionsErrors;
export default expect;

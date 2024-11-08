'use strict';

const { bind } = require('jest-each');
const { ErrorWithStack, convertDescriptorToString, isPromise } = require('jest-util');
const { dispatchSync, getState, resetState, setState } = require('./state');
const run = require('./run').default;

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// Describe block for grouping tests
const describe = (() => {
  function internalDescribe(blockName, blockFn) {
    _dispatchDescribe(blockName, blockFn, internalDescribe);
  }

  function only(blockName, blockFn) {
    _dispatchDescribe(blockName, blockFn, only, 'only');
  }

  function skip(blockName, blockFn) {
    _dispatchDescribe(blockName, blockFn, skip, 'skip');
  }

  internalDescribe.each = bind(internalDescribe, false);
  only.each = bind(only, false);
  skip.each = bind(skip, false);
  internalDescribe.only = only;
  internalDescribe.skip = skip;

  return internalDescribe;
})();

function _dispatchDescribe(blockName, blockFn, describeFn, mode) {
  const asyncError = new ErrorWithStack(undefined, describeFn);
  if (typeof blockFn !== 'function') {
    asyncError.message = `Invalid second argument. It must be a callback function.`;
    throw asyncError;
  }

  try {
    blockName = convertDescriptorToString(blockName);
  } catch (error) {
    asyncError.message = error.message;
    throw asyncError;
  }

  dispatchSync({
    asyncError,
    blockName,
    mode,
    name: 'start_describe_definition',
  });

  const result = blockFn();
  if (isPromise(result)) {
    throw new ErrorWithStack('Returning a Promise from "describe" is not supported.', describeFn);
  } else if (result !== undefined) {
    throw new ErrorWithStack('A "describe" callback must not return a value.', describeFn);
  }

  dispatchSync({
    blockName,
    mode,
    name: 'finish_describe_definition',
  });
}

function _addHook(fn, hookType, hookFn, timeout) {
  const asyncError = new ErrorWithStack(undefined, hookFn);
  if (typeof fn !== 'function') {
    asyncError.message = 'Invalid first argument. It must be a callback function.';
    throw asyncError;
  }

  dispatchSync({
    asyncError,
    fn,
    hookType,
    name: 'add_hook',
    timeout,
  });
}

const beforeEach = (fn, timeout) => _addHook(fn, 'beforeEach', beforeEach, timeout);
const beforeAll = (fn, timeout) => _addHook(fn, 'beforeAll', beforeAll, timeout);
const afterEach = (fn, timeout) => _addHook(fn, 'afterEach', afterEach, timeout);
const afterAll = (fn, timeout) => _addHook(fn, 'afterAll', afterAll, timeout);

const test = (() => {
  function internalTest(testName, fn, timeout) {
    return _addTest(testName, undefined, false, fn, internalTest, timeout);
  }

  function skip(testName, fn, timeout) {
    return _addTest(testName, 'skip', false, fn, skip, timeout);
  }

  function only(testName, fn, timeout) {
    return _addTest(testName, 'only', false, fn, only, timeout);
  }

  function concurrentTest(testName, fn, timeout) {
    return _addTest(testName, undefined, true, fn, concurrentTest, timeout);
  }

  internalTest.todo = (testName, ...rest) => {
    if (rest.length > 0 || typeof testName !== 'string') {
      throw new ErrorWithStack('Todo must be called with only a description.', internalTest.todo);
    }
    return _addTest(testName, 'todo', false, () => {}, internalTest.todo);
  };

  function _addTest(testName, mode, concurrent, fn, testFn, timeout, failing, asyncError = new ErrorWithStack(undefined, testFn)) {
    try {
      testName = convertDescriptorToString(testName);
    } catch (error) {
      asyncError.message = error.message;
      throw asyncError;
    }

    if (typeof fn !== 'function') {
      asyncError.message = `Invalid second argument. It must be a callback function.`;
      throw asyncError;
    }

    dispatchSync({
      asyncError,
      concurrent,
      failing: failing || false,
      fn,
      mode,
      name: 'add_test',
      testName,
      timeout,
    });
  }

  internalTest.each = bind(internalTest);
  only.each = bind(only);
  skip.each = bind(skip);

  internalTest.only = only;
  internalTest.skip = skip;
  internalTest.concurrent = concurrentTest;
  concurrentTest.each = bind(concurrentTest, false);

  return internalTest;
})();

const it = test;

exports.describe = describe;
exports.beforeEach = beforeEach;
exports.beforeAll = beforeAll;
exports.afterEach = afterEach;
exports.afterAll = afterAll;
exports.test = test;
exports.it = it;
exports.default = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  test,
};

Object.defineProperty(exports, 'getState', {
  enumerable: true,
  get: () => getState,
});

Object.defineProperty(exports, 'resetState', {
  enumerable: true,
  get: () => resetState,
});

Object.defineProperty(exports, 'setState', {
  enumerable: true,
  get: () => setState,
});

Object.defineProperty(exports, 'run', {
  enumerable: true,
  get: () => run,
});

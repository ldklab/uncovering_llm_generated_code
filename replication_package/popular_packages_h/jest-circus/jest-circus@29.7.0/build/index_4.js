'use strict';

const { bind } = require('jest-each');
const { convertDescriptorToString, ErrorWithStack, isPromise } = require('jest-util');
const { dispatchSync, getState, resetState, setState } = require('./state');
const run = require('./run').default;

const describe = (() => {
  const describe = (name, fn) => executeDescribe(fn, name, describe);
  const only = (name, fn) => executeDescribe(fn, name, only, 'only');
  const skip = (name, fn) => executeDescribe(fn, name, skip, 'skip');

  describe.each = bind(describe, false);
  only.each = bind(only, false);
  skip.each = bind(skip, false);

  describe.only = only;
  describe.skip = skip;

  return describe;
})();

function executeDescribe(fn, name, describeFn, mode) {
  const asyncError = new ErrorWithStack(undefined, describeFn);

  if (typeof fn !== 'function') {
    asyncError.message = `Invalid second argument, ${fn}. It must be a callback function.`;
    throw asyncError;
  }

  try {
    name = convertDescriptorToString(name);
  } catch (error) {
    asyncError.message = error.message;
    throw asyncError;
  }

  dispatchSync({ asyncError, blockName: name, mode, name: 'start_describe_definition' });

  const result = fn();
  if (isPromise(result)) {
    throw new ErrorWithStack(
      'Returning a Promise from "describe" is not supported. Tests must be defined synchronously.',
      describeFn
    );
  } else if (result !== undefined) {
    throw new ErrorWithStack('A "describe" callback must not return a value.', describeFn);
  }

  dispatchSync({ blockName: name, mode, name: 'finish_describe_definition' });
}

function createHookFunction(hookType) {
  return (fn, timeout) => {
    const asyncError = new ErrorWithStack(undefined, fn);

    if (typeof fn !== 'function') {
      asyncError.message = 'Invalid first argument. It must be a callback function.';
      throw asyncError;
    }

    dispatchSync({ asyncError, fn, hookType, name: 'add_hook', timeout });
  };
}

const beforeEach = createHookFunction('beforeEach');
const beforeAll = createHookFunction('beforeAll');
const afterEach = createHookFunction('afterEach');
const afterAll = createHookFunction('afterAll');

const test = (() => {
  function _addTest(testName, mode, concurrent, fn, testFn, timeout) {
    const asyncError = new ErrorWithStack(undefined, testFn);

    try {
      testName = convertDescriptorToString(testName);
    } catch (error) {
      asyncError.message = error.message;
      throw asyncError;
    }

    if (typeof fn !== 'function') {
      asyncError.message = `Invalid second argument, ${fn}. It must be a callback function.`;
      throw asyncError;
    }

    return dispatchSync({
      asyncError, concurrent, fn, mode, name: 'add_test', testName, timeout
    });
  }

  const defineTest = (testName, fn, timeout) => _addTest(testName, undefined, false, fn, test, timeout);
  const skip = (testName, fn, timeout) => _addTest(testName, 'skip', false, fn, skip, timeout);
  const only = (testName, fn, timeout) => _addTest(testName, 'only', false, fn, only, timeout);

  const concurrentTest = (testName, fn, timeout) => _addTest(testName, undefined, true, fn, concurrentTest, timeout);
  const concurrentOnly = (testName, fn, timeout) => _addTest(testName, 'only', true, fn, concurrentOnly, timeout);

  const todo = (testName) => {
    if (typeof testName !== 'string') {
      throw new ErrorWithStack('Todo must be called with only a description.', todo);
    }

    return _addTest(testName, 'todo', false, () => {}, todo);
  };

  defineTest.each = bind(defineTest);
  only.each = bind(only);
  skip.each = bind(skip);
  concurrentTest.each = bind(concurrentTest, false);
  concurrentOnly.each = bind(concurrentOnly, false);

  return {
    ...defineTest,
    only,
    skip,
    todo,
    concurrent: {
      ...concurrentTest,
      only: concurrentOnly,
      skip: concurrentTest,
    }
  };
})();

const it = test;

module.exports = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  test,
  getState,
  resetState,
  setState,
  run
};

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

const { getState, resetState, setState, dispatchSync } = require('./state');
const run = require('./run').default;
const { bind } = require('jest-each');
const { ErrorWithStack, convertDescriptorToString, isPromise } = require('jest-util');

exports.getState = getState;
exports.resetState = resetState;
exports.setState = setState;
exports.run = run;

const describe = (() => {
  const createDescribe = (mode) => (blockName, blockFn) => {
    const asyncError = new ErrorWithStack(undefined, createDescribe);
    validateBlock(blockName, blockFn, asyncError);
    dispatchSync({ asyncError, blockName, mode, name: 'start_describe_definition' });

    const describeReturn = blockFn();
    if (isPromise(describeReturn)) throw new ErrorWithStack('Returning a Promise from "describe" is not supported.', createDescribe);

    dispatchSync({ blockName, mode, name: 'finish_describe_definition' });
  };

  const describe = createDescribe();
  describe.only = createDescribe('only');
  describe.skip = createDescribe('skip');

  describe.each = bind(describe);
  describe.only.each = bind(describe.only);
  describe.skip.each = bind(describe.skip);

  return describe;
})();

exports.describe = describe;

const hooks = (hookType) => (fn, timeout) => addHook(fn, hookType, timeout);

const addHook = (fn, hookType, timeout) => {
  const asyncError = new ErrorWithStack(undefined, hookType);
  validateFunction(fn, asyncError);

  dispatchSync({ asyncError, fn, hookType, name: 'add_hook', timeout });
};

const validateBlock = (blockName, blockFn, asyncError) => {
  if (blockFn === undefined) {
    asyncError.message = 'Missing second argument. It must be a callback function.';
    throw asyncError;
  }
  validateFunction(blockFn, asyncError);
  try {
    convertDescriptorToString(blockName);
  } catch (error) {
    asyncError.message = error.message;
    throw asyncError;
  }
};

const validateFunction = (fn, asyncError) => {
  if (typeof fn !== 'function') {
    asyncError.message = `Invalid second argument, ${fn}. It must be a callback function.`;
    throw asyncError;
  }
};

exports.beforeEach = hooks('beforeEach');
exports.beforeAll = hooks('beforeAll');
exports.afterEach = hooks('afterEach');
exports.afterAll = hooks('afterAll');

const test = (() => {
  const createTest = (mode, concurrent) => (testName, fn, timeout) =>
    addTest({ mode, concurrent, fn, timeout, testName });

  const addTest = ({ mode, concurrent, fn, timeout, testName }) => {
    const asyncError = new ErrorWithStack(undefined);
    try {
      convertDescriptorToString(testName);
    } catch (error) {
      asyncError.message = error.message;
      throw asyncError;
    }
    validateFunction(fn, asyncError);

    return dispatchSync({ asyncError, concurrent, fn, mode, name: 'add_test', testName, timeout });
  };

  const test = createTest();
  test.only = createTest('only');
  test.skip = createTest('skip');
  test.concurrent = createTest(undefined, true);
  test.todo = (testName) => {
    if (typeof testName !== 'string') throw new ErrorWithStack('Todo must be called with only a description.', test.todo);
    return dispatchSync({ mode: 'todo', name: 'add_test', testName });
  };

  test.each = bind(test);
  test.only.each = bind(test.only);
  test.skip.each = bind(test.skip);

  return test;
})();

exports.test = test;
exports.it = test;

exports.default = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  test
};

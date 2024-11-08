'use strict';

const chalk = require('chalk');
const { bind } = require('jest-each');
const { formatExecError, ErrorWithStack } = require('jest-message-util');
const { isPromise } = require('jest-util');
const { dispatchSync } = require('./state');

const createDescribe = () => {
  const describe = (blockName, blockFn) => dispatchDescribe(blockName, blockFn);
  describe.only = createDescribeVariant('only');
  describe.skip = createDescribeVariant('skip');
  describe.each = bind(describe);
  return describe;
};

const dispatchDescribe = (blockName, blockFn, mode) => {
  const asyncError = new ErrorWithStack(undefined, dispatchDescribe);

  if (typeof blockFn !== 'function') {
    asyncError.message = `Second argument must be a callback function.`;
    throw asyncError;
  }

  dispatchSync({ asyncError, blockName, mode, name: 'start_describe_definition' });

  const result = blockFn();
  if (isPromise(result) || result !== undefined) {
    console.log(formatExecError(
      new ErrorWithStack(
        chalk.yellow('Describe callback should not return a value.'),
        dispatchDescribe
      ),
      { rootDir: '', testMatch: [] }
    ));
  }

  dispatchSync({ blockName, mode, name: 'finish_describe_definition' });
};

const createDescribeVariant = (variant) => {
  return (blockName, blockFn) => dispatchDescribe(blockName, blockFn, variant);
};

const createHook = (hookType) => {
  return (fn, timeout) => {
    const asyncError = new ErrorWithStack(undefined, createHook);
    if (typeof fn !== 'function') {
      asyncError.message = 'First argument must be a callback function.';
      throw asyncError;
    }
    dispatchSync({ asyncError, fn, hookType, name: 'add_hook', timeout });
  };
};

const beforeEach = createHook('beforeEach');
const beforeAll = createHook('beforeAll');
const afterEach = createHook('afterEach');
const afterAll = createHook('afterAll');

const createTest = () => {
  const test = (testName, fn, timeout) => dispatchTest(testName, fn, undefined, test, timeout);
  test.only = createTestVariant('only');
  test.skip = createTestVariant('skip');
  test.todo = (testName) => {
    if (typeof testName !== 'string') {
      throw new ErrorWithStack('Todo must have a description.', test.todo);
    }
    dispatchTest(testName, () => {}, 'todo', test.todo);
  };
  test.each = bind(test);
  return test;
};

const dispatchTest = (testName, fn, mode, testFn, timeout) => {
  const asyncError = new ErrorWithStack(undefined, testFn);

  if (typeof testName !== 'string') {
    asyncError.message = 'First argument must be a string.';
    throw asyncError;
  }

  if (typeof fn !== 'function') {
    asyncError.message = `Second argument must be a callback function.`;
    throw asyncError;
  }

  dispatchSync({ asyncError, fn, mode, name: 'add_test', testName, timeout });
};

const createTestVariant = (variant) => {
  return (testName, fn, timeout) => dispatchTest(testName, fn, variant, createTestVariant, timeout);
};

const describe = createDescribe();
const test = createTest();
const it = test;

module.exports = {
  describe,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
  test,
  it,
  default: {
    describe,
    beforeAll,
    beforeEach,
    afterAll,
    afterEach,
    test,
    it
  }
};

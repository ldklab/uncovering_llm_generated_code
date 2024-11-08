'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

const chalk = require('chalk').default;
const { bind } = require('jest-each');
const { formatExecError } = require('jest-message-util');
const { ErrorWithStack, isPromise } = require('jest-util');
const { dispatchSync } = require('./state');

function createDescribe() {
  const describe = (blockName, blockFn) =>
    dispatchDescribe(blockFn, blockName, describe);
    
  const skip = (blockName, blockFn) =>
    dispatchDescribe(blockFn, blockName, skip, 'skip');
    
  const only = (blockName, blockFn) =>
    dispatchDescribe(blockFn, blockName, only, 'only');
    
  describe.each = bind(describe, false);
  describe.skip = skip;
  describe.only = only;
  skip.each = bind(skip, false);
  only.each = bind(only, false);
  
  return describe;
}

const describe = createDescribe();
exports.describe = describe;

function dispatchDescribe(blockFn, blockName, describeFn, mode) {
  const asyncError = new ErrorWithStack(undefined, describeFn);

  if (blockFn === undefined) {
    asyncError.message = 'Missing second argument. It must be a callback function.';
    throw asyncError;
  }
  
  if (typeof blockFn !== 'function') {
    asyncError.message = `Invalid second argument, ${blockFn}. It must be a callback function.`;
    throw asyncError;
  }

  dispatchSync({
    asyncError, blockName, mode, name: 'start_describe_definition'
  });
  
  const describeReturn = blockFn(); 

  if (isPromise(describeReturn)) {
    console.log(formatExecError(new ErrorWithStack(
      chalk.yellow('Returning a Promise from "describe" is not supported. Tests must be defined synchronously.\nReturning a value from "describe" will fail the test in a future version of Jest.'),
      describeFn
    ), { rootDir: '', testMatch: [] }, { noStackTrace: false }));
  } else if (describeReturn !== undefined) {
    console.log(formatExecError(new ErrorWithStack(
      chalk.yellow('A "describe" callback must not return a value.\nReturning a value from "describe" will fail the test in a future version of Jest.'),
      describeFn
    ), { rootDir: '', testMatch: [] }, { noStackTrace: false }));
  }

  dispatchSync({
    blockName, mode, name: 'finish_describe_definition'
  });
}

function addHook(fn, hookType, hookFn, timeout) {
  const asyncError = new ErrorWithStack(undefined, hookFn);

  if (typeof fn !== 'function') {
    asyncError.message = 'Invalid first argument. It must be a callback function.';
    throw asyncError;
  }

  dispatchSync({
    asyncError, fn, hookType, name: 'add_hook', timeout
  });
}

exports.beforeEach = (fn, timeout) => addHook(fn, 'beforeEach', exports.beforeEach, timeout);
exports.beforeAll = (fn, timeout) => addHook(fn, 'beforeAll', exports.beforeAll, timeout);
exports.afterEach = (fn, timeout) => addHook(fn, 'afterEach', exports.afterEach, timeout);
exports.afterAll = (fn, timeout) => addHook(fn, 'afterAll', exports.afterAll, timeout);

function createTest() {
  const test = (testName, fn, timeout) =>
    addTest(testName, undefined, fn, test, timeout);
  
  const skip = (testName, fn, timeout) =>
    addTest(testName, 'skip', fn, skip, timeout);
    
  const only = (testName, fn, timeout) =>
    addTest(testName, 'only', fn, test.only, timeout);

  test.todo = (testName, ...rest) => {
    if (rest.length > 0 || typeof testName !== 'string') {
      throw new ErrorWithStack('Todo must be called with only a description.', test.todo);
    }

    return addTest(testName, 'todo', () => {}, test.todo);
  };

  const addTest = (testName, mode, fn, testFn, timeout) => {
    const asyncError = new ErrorWithStack(undefined, testFn);
    
    if (typeof testName !== 'string') {
      asyncError.message = `Invalid first argument, ${testName}. It must be a string.`;
      throw asyncError;
    }
    
    if (fn === undefined) {
      asyncError.message = 'Missing second argument. It must be a callback function. Perhaps you want to use `test.todo` for a test placeholder.';
      throw asyncError;
    }
    
    if (typeof fn !== 'function') {
      asyncError.message = `Invalid second argument, ${fn}. It must be a callback function.`;
      throw asyncError;
    }
    
    return dispatchSync({
      asyncError, fn, mode, name: 'add_test', testName, timeout
    });
  };

  test.each = bind(test);
  test.skip = skip;
  test.only = only;
  only.each = bind(only);
  skip.each = bind(skip);
  
  return test;
}

const test = createTest();
exports.test = test;
exports.it = test;

exports.default = {
  afterAll: exports.afterAll,
  afterEach: exports.afterEach,
  beforeAll: exports.beforeAll,
  beforeEach: exports.beforeEach,
  describe: exports.describe,
  it: exports.it,
  test: exports.test
};

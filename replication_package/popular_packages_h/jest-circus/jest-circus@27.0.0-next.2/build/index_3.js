'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

exports.default = exports.test = exports.it = exports.describe = exports.beforeEach = exports.beforeAll = exports.afterEach = exports.afterAll = void 0;

const chalk = require('chalk').default;
const { bind } = require('jest-each');
const { formatExecError, ErrorWithStack } = require('jest-message-util');
const { isPromise } = require('jest-util');
const { dispatchSync } = require('./state');

const describe = (() => {
  function describe(blockName, blockFn) {
    return _dispatchDescribe(blockFn, blockName, describe);
  }

  describe.only = function only(blockName, blockFn) {
    return _dispatchDescribe(blockFn, blockName, only, 'only');
  };

  describe.skip = function skip(blockName, blockFn) {
    return _dispatchDescribe(blockFn, blockName, skip, 'skip');
  };

  describe.each = bind(describe, false);
  describe.only.each = bind(describe.only, false);
  describe.skip.each = bind(describe.skip, false);

  return describe;
})();

exports.describe = describe;

function _dispatchDescribe(blockFn, blockName, describeFn, mode) {
  const asyncError = new ErrorWithStack(undefined, describeFn);

  if (typeof blockFn !== 'function') {
    asyncError.message = `Invalid second argument, ${blockFn}. It must be a callback function.`;
    throw asyncError;
  }

  dispatchSync({
    asyncError,
    blockName,
    mode,
    name: 'start_describe_definition'
  });

  const describeReturn = blockFn();

  if (isPromise(describeReturn)) {
    console.log(formatExecError(new ErrorWithStack(
      chalk.yellow('Returning a Promise from "describe" is not supported. Tests must be defined synchronously. Returning a value from "describe" will fail the test in a future version of Jest.'),
      describeFn
    ), {
      rootDir: '',
      testMatch: []
    }, {
      noStackTrace: false
    }));
  } else if (describeReturn !== undefined) {
    console.log(formatExecError(new ErrorWithStack(
      chalk.yellow('A "describe" callback must not return a value. Returning a value from "describe" will fail the test in a future version of Jest.'),
      describeFn
    ), {
      rootDir: '',
      testMatch: []
    }, {
      noStackTrace: false
    }));
  }

  dispatchSync({
    blockName,
    mode,
    name: 'finish_describe_definition'
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
    timeout
  });
}

const beforeEach = (fn, timeout) => _addHook(fn, 'beforeEach', beforeEach, timeout);
exports.beforeEach = beforeEach;

const beforeAll = (fn, timeout) => _addHook(fn, 'beforeAll', beforeAll, timeout);
exports.beforeAll = beforeAll;

const afterEach = (fn, timeout) => _addHook(fn, 'afterEach', afterEach, timeout);
exports.afterEach = afterEach;

const afterAll = (fn, timeout) => _addHook(fn, 'afterAll', afterAll, timeout);
exports.afterAll = afterAll;

const test = (() => {
  function test(testName, fn, timeout) {
    return _addTest(testName, undefined, fn, test, timeout);
  }

  test.skip = function skip(testName, fn, timeout) {
    return _addTest(testName, 'skip', fn, skip, timeout);
  };

  test.only = function only(testName, fn, timeout) {
    return _addTest(testName, 'only', fn, only, timeout);
  };

  test.todo = function(todoName) {
    if (typeof todoName !== 'string') {
      throw new ErrorWithStack('Todo must be called with only a description.', test.todo);
    }
    return _addTest(todoName, 'todo', () => {}, test.todo);
  };

  test.each = bind(test);

  return test;
})();

function _addTest(testName, mode, fn, testFn, timeout) {
  const asyncError = new ErrorWithStack(undefined, testFn);

  if (typeof testName !== 'string') {
    asyncError.message = `Invalid first argument, ${testName}. It must be a string.`;
    throw asyncError;
  }

  if (fn === undefined || typeof fn !== 'function') {
    asyncError.message = 'Missing or invalid second argument. It must be a callback function.';
    throw asyncError;
  }

  return dispatchSync({
    asyncError,
    fn,
    mode,
    name: 'add_test',
    testName,
    timeout
  });
}

exports.test = test;

const it = test;
exports.it = it;

exports.default = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  test
};

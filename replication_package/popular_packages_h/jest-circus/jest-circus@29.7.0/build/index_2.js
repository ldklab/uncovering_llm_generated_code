'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

exports.describe = exports.default = exports.beforeEach = exports.beforeAll = exports.afterEach = exports.afterAll = void 0;

Object.defineProperty(exports, 'getState', {
  enumerable: true,
  get: function () {
    return _state.getState;
  }
});

exports.it = void 0;

Object.defineProperty(exports, 'resetState', {
  enumerable: true,
  get: function () {
    return _state.resetState;
  }
});

Object.defineProperty(exports, 'run', {
  enumerable: true,
  get: function () {
    return _run.default;
  }
});

Object.defineProperty(exports, 'setState', {
  enumerable: true,
  get: function () {
    return _state.setState;
  }
});

exports.test = void 0;

var _jestEach = require('jest-each');
var _jestUtil = require('jest-util');
var _state = require('./state');
var _run = _interopRequireDefault(require('./run'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

const describe = (() => {
  const describeBlock = (blockName, blockFn) => _dispatchDescribe(blockFn, blockName, describeBlock);
  const only = (blockName, blockFn) => _dispatchDescribe(blockFn, blockName, only, 'only');
  const skip = (blockName, blockFn) => _dispatchDescribe(blockFn, blockName, skip, 'skip');
  describeBlock.each = _jestEach.bind(describeBlock, false);
  only.each = _jestEach.bind(only, false);
  skip.each = _jestEach.bind(skip, false);
  describeBlock.only = only;
  describeBlock.skip = skip;
  return describeBlock;
})();

exports.describe = describe;

const _dispatchDescribe = (blockFn, blockName, describeFn, mode) => {
  const asyncError = new _jestUtil.ErrorWithStack(undefined, describeFn);
  if (typeof blockFn !== 'function') throw createError(asyncError, 'Invalid second argument, must be a callback function.');
  try {
    blockName = _jestUtil.convertDescriptorToString(blockName);
  } catch (error) {
    throw createError(asyncError, error.message);
  }
  _state.dispatchSync({ asyncError, blockName, mode, name: 'start_describe_definition' });
  const describeReturn = blockFn();
  validateDescribeReturn(describeReturn, asyncError, describeFn);
  _state.dispatchSync({ blockName, mode, name: 'finish_describe_definition' });
};

function createError(error, message) {
  error.message = message;
  return error;
}

function validateDescribeReturn(describeReturn, asyncError, describeFn) {
  if (_jestUtil.isPromise(describeReturn)) {
    throw createError(asyncError, 'Returning a Promise from "describe" is not supported. Tests must be defined synchronously.');
  } else if (describeReturn !== undefined) {
    throw createError(asyncError, 'A "describe" callback must not return a value.');
  }
}

const _addHook = (fn, hookType, hookFn, timeout) => {
  const asyncError = new _jestUtil.ErrorWithStack(undefined, hookFn);
  if (typeof fn !== 'function') throw createError(asyncError, 'Invalid first argument. It must be a callback function.');
  _state.dispatchSync({ asyncError, fn, hookType, name: 'add_hook', timeout });
};

const beforeEach = (fn, timeout) => _addHook(fn, 'beforeEach', beforeEach, timeout);
exports.beforeEach = beforeEach;

const beforeAll = (fn, timeout) => _addHook(fn, 'beforeAll', beforeAll, timeout);
exports.beforeAll = beforeAll;

const afterEach = (fn, timeout) => _addHook(fn, 'afterEach', afterEach, timeout);
exports.afterEach = afterEach;

const afterAll = (fn, timeout) => _addHook(fn, 'afterAll', afterAll, timeout);
exports.afterAll = afterAll;

const test = (() => {
  const testBlock = (testName, fn, timeout) => _addTest(testName, undefined, false, fn, testBlock, timeout);
  const skip = (testName, fn, timeout) => _addTest(testName, 'skip', false, fn, skip, timeout);
  const only = (testName, fn, timeout) => _addTest(testName, 'only', false, fn, testBlock.only, timeout);
  const concurrentTest = (testName, fn, timeout) => _addTest(testName, undefined, true, fn, concurrentTest, timeout);
  const concurrentOnly = (testName, fn, timeout) => _addTest(testName, 'only', true, fn, concurrentOnly, timeout);
  const bindFailing = (concurrent, mode) => failingTestFunction(concurrent, mode);

  testBlock.todo = (testName, ...rest) => {
    if (rest.length || typeof testName !== 'string') throw new _jestUtil.ErrorWithStack('Todo must be called with only a description.', testBlock.todo);
    return _addTest(testName, 'todo', false, () => {}, testBlock.todo);
  };

  const failingTestFunction = (concurrent, mode) => {
    const failing = (testName, fn, timeout, eachError) => _addTest(testName, mode, concurrent, fn, failing, timeout, true, eachError);
    failing.each = _jestEach.bind(failing, false, true);
    return failing;
  };

  const _addTest = (testName, mode, concurrent, fn, testFn, timeout, failing, asyncError = new _jestUtil.ErrorWithStack(undefined, testFn)) => {
    validateTestArguments(fn, asyncError);
    try {
      testName = _jestUtil.convertDescriptorToString(testName);
    } catch (error) {
      throw createError(asyncError, error.message);
    }
    return _state.dispatchSync({ asyncError, concurrent, failing: !!failing, fn, mode, name: 'add_test', testName, timeout });
  };

  function validateTestArguments(fn, asyncError) {
    if (fn === undefined) throw createError(asyncError, 'Missing second argument. It must be a callback function. Perhaps you want to use `test.todo` for a test placeholder.');
    if (typeof fn !== 'function') throw createError(asyncError, `Invalid second argument, ${fn}. It must be a callback function.`);
  }

  testBlock.each = _jestEach.bind(testBlock);
  only.each = _jestEach.bind(only);
  skip.each = _jestEach.bind(skip);
  concurrentTest.each = _jestEach.bind(concurrentTest, false);
  concurrentOnly.each = _jestEach.bind(concurrentOnly, false);
  only.failing = bindFailing(false, 'only');
  skip.failing = bindFailing(false, 'skip');
  testBlock.failing = bindFailing(false);
  testBlock.only = only;
  testBlock.skip = skip;
  testBlock.concurrent = concurrentTest;
  concurrentTest.only = concurrentOnly;
  concurrentTest.skip = skip;
  concurrentTest.failing = bindFailing(true);
  concurrentOnly.failing = bindFailing(true, 'only');

  return testBlock;
})();

exports.test = test;

const it = test;
exports.it = it;

var _default = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  it,
  test
};

exports.default = _default;

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
Object.defineProperty(exports, 'bind', {
  enumerable: true,
  get: function () {
    return _bind.default;
  }
});
exports.default = void 0;

const _bind = _interopRequireDefault(require('./bind'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

// A method to install test framework bindings
const install = (globalObject, table, ...data) => {
  const useBindingArray = data.length === 0;
  const useBindingTemplate = Array.isArray(table) && !!table.raw;

  if (!useBindingArray && !useBindingTemplate) {
    throw new Error('`.each` must be called with an Array or Tagged Template Literal.');
  }

  // Creates a binding with the specified test function
  const test = (title, fn, timeout) =>
    (0, _bind.default)(globalObject.test)(table, ...data)(title, fn, timeout);

  // Adding skip and only functionality to test
  test.skip = (0, _bind.default)(globalObject.test.skip)(table, ...data);
  test.only = (0, _bind.default)(globalObject.test.only)(table, ...data);

  // Concurrent testing capability
  const testConcurrent = (title, fn, timeout) =>
    (0, _bind.default)(globalObject.test.concurrent)(table, ...data)(title, fn, timeout);

  test.concurrent = testConcurrent;
  testConcurrent.only = (0, _bind.default)(globalObject.test.concurrent.only)(table, ...data);
  testConcurrent.skip = (0, _bind.default)(globalObject.test.concurrent.skip)(table, ...data);

  // Defining `it` function similarly
  const it = (title, fn, timeout) =>
    (0, _bind.default)(globalObject.it)(table, ...data)(title, fn, timeout);

  it.skip = (0, _bind.default)(globalObject.it.skip)(table, ...data);
  it.only = (0, _bind.default)(globalObject.it.only)(table, ...data);
  it.concurrent = testConcurrent;

  // Define aliases xit and fit
  const xit = (0, _bind.default)(globalObject.xit)(table, ...data);
  const fit = (0, _bind.default)(globalObject.fit)(table, ...data);
  const xtest = (0, _bind.default)(globalObject.xtest)(table, ...data);

  // Defining `describe` and its variants
  const describe = (title, suite, timeout) =>
    (0, _bind.default)(globalObject.describe, false)(table, ...data)(title, suite, timeout);

  describe.skip = (0, _bind.default)(globalObject.describe.skip, false)(table, ...data);
  describe.only = (0, _bind.default)(globalObject.describe.only, false)(table, ...data);
  const fdescribe = (0, _bind.default)(globalObject.fdescribe, false)(table, ...data);
  const xdescribe = (0, _bind.default)(globalObject.xdescribe, false)(table, ...data);

  // Returning all bound functions
  return {
    describe,
    fdescribe,
    fit,
    it,
    test,
    xdescribe,
    xit,
    xtest
  };
};

// Main function to handle parameterized tests
const each = (table, ...data) => install(global, table, ...data);

// Allowing specification of custom global context
each.withGlobal = g => (table, ...data) => install(g, table, ...data);

// Exporting the default `each` function
var _default = each;
exports.default = _default;

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

var _bind = _interopRequireDefault(require('./bind'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// Core functionality for setting up parameterized tests.
const install = (g, table, ...data) => {
  const isBindingWithArray = data.length === 0;
  const isBindingWithTemplate = Array.isArray(table) && !!table.raw;

  if (!isBindingWithArray && !isBindingWithTemplate) {
    throw new Error('`.each` must only be called with an Array or Tagged Template Literal.');
  }

  // Parameterized test definition for `test`.
  const test = (title, fn, timeout) => 
    (0, _bind.default)(g.test)(table, ...data)(title, fn, timeout);
  test.skip = (0, _bind.default)(g.test.skip)(table, ...data);
  test.only = (0, _bind.default)(g.test.only)(table, ...data);

  // Parameterized test definition for `test.concurrent`.
  const testConcurrent = (title, fn, timeout) => 
    (0, _bind.default)(g.test.concurrent)(table, ...data)(title, fn, timeout);
  test.concurrent = testConcurrent;
  testConcurrent.skip = (0, _bind.default)(g.test.concurrent.skip)(table, ...data);
  testConcurrent.only = (0, _bind.default)(g.test.concurrent.only)(table, ...data);

  // Parameterized test definition for `it`.
  const it = (title, fn, timeout) => 
    (0, _bind.default)(g.it)(table, ...data)(title, fn, timeout);
  it.skip = (0, _bind.default)(g.it.skip)(table, ...data);
  it.only = (0, _bind.default)(g.it.only)(table, ...data);
  it.concurrent = testConcurrent;

  // Parameterized test definitions for other functions.
  const xit = (0, _bind.default)(g.xit)(table, ...data);
  const fit = (0, _bind.default)(g.fit)(table, ...data);
  const xtest = (0, _bind.default)(g.xtest)(table, ...data);

  // Parameterized suite definition for `describe`.
  const describe = (title, suite, timeout) => 
    (0, _bind.default)(g.describe, false)(table, ...data)(title, suite, timeout);
  describe.skip = (0, _bind.default)(g.describe.skip, false)(table, ...data);
  describe.only = (0, _bind.default)(g.describe.only, false)(table, ...data);
  
  const fdescribe = (0, _bind.default)(g.fdescribe, false)(table, ...data);
  const xdescribe = (0, _bind.default)(g.xdescribe, false)(table, ...data);

  return {
    describe, fdescribe, fit, it, test, xdescribe, xit, xtest
  };
};

// Main function for attaching the parameterized testing utilities to the global context.
const each = (table, ...data) => install(global, table, ...data);

// Allows configuration with a custom global context.
each.withGlobal = g => (table, ...data) => install(g, table, ...data);

// Default export for the module.
var _default = each;
exports.default = _default;

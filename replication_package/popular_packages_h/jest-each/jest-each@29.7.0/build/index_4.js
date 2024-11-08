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

/**
 * Module for parameterized testing, allowing tests to be defined with various data sets
 * using arrays or tagged template literals. Originally created by Meta Platforms, Inc.
 * under the MIT license.
 */

const install = (g, table, ...data) => {
  const isBindingWithArray = data.length === 0;
  const isBindingWithTemplate = Array.isArray(table) && !!table.raw;
  
  if (!isBindingWithArray && !isBindingWithTemplate) {
    throw new Error('`.each` must be called with an Array or Tagged Template Literal.');
  }

  const createTestFunction = (method, isConcurrent = false) => {
    return (title, fn, timeout) => (0, _bind.default)(g[method])(table, ...data)(title, fn, timeout);
  };

  const test = createTestFunction('test');
  test.skip = (0, _bind.default)(g.test.skip)(table, ...data);
  test.only = (0, _bind.default)(g.test.only)(table, ...data);
  
  const testConcurrent = createTestFunction('test.concurrent', true);
  test.concurrent = testConcurrent;
  testConcurrent.only = (0, _bind.default)(g.test.concurrent.only)(table, ...data);
  testConcurrent.skip = (0, _bind.default)(g.test.concurrent.skip)(table, ...data);

  const it = createTestFunction('it');
  it.skip = (0, _bind.default)(g.it.skip)(table, ...data);
  it.only = (0, _bind.default)(g.it.only)(table, ...data);
  it.concurrent = testConcurrent;

  const describe = createTestFunction('describe');
  describe.skip = (0, _bind.default)(g.describe.skip, false)(table, ...data);
  describe.only = (0, _bind.default)(g.describe.only, false)(table, ...data);

  return {
    test,
    it,
    describe,
    xit: (0, _bind.default)(g.xit)(table, ...data),
    fit: (0, _bind.default)(g.fit)(table, ...data),
    xtest: (0, _bind.default)(g.xtest)(table, ...data),
    fdescribe: (0, _bind.default)(g.fdescribe, false)(table, ...data),
    xdescribe: (0, _bind.default)(g.xdescribe, false)(table, ...data)
  };
};

const each = (table, ...data) => install(globalThis, table, ...data);

each.withGlobal = g => (table, ...data) => install(g, table, ...data);

exports.default = each;

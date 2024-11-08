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
  return obj && obj.__esModule ? obj : {default: obj};
}

const install = (globalContext, table, ...parameters) => {
  const isArrayBinding = parameters.length === 0;
  const isTemplateBinding = Array.isArray(table) && !!table.raw;

  if (!isArrayBinding && !isTemplateBinding) {
    throw new Error(
      '`.each` must only be called with an Array or Tagged Template Literal.'
    );
  }

  const test = (title, testFn, timeout) =>
    (0, _bind.default)(globalContext.test)(table, ...parameters)(title, testFn, timeout);

  test.skip = (0, _bind.default)(globalContext.test.skip)(table, ...parameters);
  test.only = (0, _bind.default)(globalContext.test.only)(table, ...parameters);

  const testConcurrent = (title, testFn, timeout) =>
    (0, _bind.default)(globalContext.test.concurrent)(table, ...parameters)(title, testFn, timeout);

  test.concurrent = testConcurrent;
  testConcurrent.only = (0, _bind.default)(globalContext.test.concurrent.only)(table, ...parameters);
  testConcurrent.skip = (0, _bind.default)(globalContext.test.concurrent.skip)(table, ...parameters);

  const it = (title, testFn, timeout) =>
    (0, _bind.default)(globalContext.it)(table, ...parameters)(title, testFn, timeout);

  it.skip = (0, _bind.default)(globalContext.it.skip)(table, ...parameters);
  it.only = (0, _bind.default)(globalContext.it.only)(table, ...parameters);
  it.concurrent = testConcurrent;

  const describe = (title, suiteFn, timeout) =>
    (0, _bind.default)(globalContext.describe, false)(table, ...parameters)(title, suiteFn, timeout);

  describe.skip = (0, _bind.default)(globalContext.describe.skip, false)(table, ...parameters);
  describe.only = (0, _bind.default)(globalContext.describe.only, false)(table, ...parameters);

  return {
    describe,
    fdescribe: (0, _bind.default)(globalContext.fdescribe, false)(table, ...parameters),
    fit: (0, _bind.default)(globalContext.fit)(table, ...parameters),
    it,
    test,
    xdescribe: (0, _bind.default)(globalContext.xdescribe, false)(table, ...parameters),
    xit: (0, _bind.default)(globalContext.xit)(table, ...parameters),
    xtest: (0, _bind.default)(globalContext.xtest)(table, ...parameters)
  };
};

const each = (table, ...parameters) => install(global, table, ...parameters);

each.withGlobal = customGlobal => (table, ...parameters) => install(customGlobal, table, ...parameters);

exports.default = each;

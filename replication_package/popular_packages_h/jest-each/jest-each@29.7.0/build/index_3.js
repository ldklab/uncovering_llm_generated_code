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

const install = (globalObject, tableData, ...otherData) => {
  const usingArray = otherData.length === 0;
  const usingTemplate = Array.isArray(tableData) && !!tableData.raw;
  
  if (!usingArray && !usingTemplate) {
    throw new Error('`.each` must only be called with an Array or Tagged Template Literal.');
  }

  const test = (title, testFn, timeout) =>
    (0, _bind.default)(globalObject.test)(tableData, ...otherData)(title, testFn, timeout);

  test.skip = (0, _bind.default)(globalObject.test.skip)(tableData, ...otherData);
  test.only = (0, _bind.default)(globalObject.test.only)(tableData, ...otherData);

  const concurrentTest = (title, testFn, timeout) =>
    (0, _bind.default)(globalObject.test.concurrent)(tableData, ...otherData)(title, testFn, timeout);

  test.concurrent = concurrentTest;
  concurrentTest.only = (0, _bind.default)(globalObject.test.concurrent.only)(tableData, ...otherData);
  concurrentTest.skip = (0, _bind.default)(globalObject.test.concurrent.skip)(tableData, ...otherData);

  const it = (title, testFn, timeout) =>
    (0, _bind.default)(globalObject.it)(tableData, ...otherData)(title, testFn, timeout);

  it.skip = (0, _bind.default)(globalObject.it.skip)(tableData, ...otherData);
  it.only = (0, _bind.default)(globalObject.it.only)(tableData, ...otherData);
  it.concurrent = concurrentTest;

  const xit = (0, _bind.default)(globalObject.xit)(tableData, ...otherData);
  const fit = (0, _bind.default)(globalObject.fit)(tableData, ...otherData);
  const xtest = (0, _bind.default)(globalObject.xtest)(tableData, ...otherData);

  const describe = (title, suiteFn, timeout) =>
    (0, _bind.default)(globalObject.describe, false)(tableData, ...otherData)(title, suiteFn, timeout);
  
  describe.skip = (0, _bind.default)(globalObject.describe.skip, false)(tableData, ...otherData);
  describe.only = (0, _bind.default)(globalObject.describe.only, false)(tableData, ...otherData);

  const fdescribe = (0, _bind.default)(globalObject.fdescribe, false)(tableData, ...otherData);
  const xdescribe = (0, _bind.default)(globalObject.xdescribe, false)(tableData, ...otherData);

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

const each = (tableData, ...otherData) => install(globalThis, tableData, ...otherData);

each.withGlobal = globalInstance => (tableData, ...otherData) => install(globalInstance, tableData, ...otherData);

var _default = each;
exports.default = _default;

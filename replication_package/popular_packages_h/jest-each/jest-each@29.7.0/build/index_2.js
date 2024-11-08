'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

Object.defineProperty(exports, 'bind', {
  enumerable: true,
  get: function() {
    return _bind.default;
  }
});

exports.default = void 0;

const _bind = _interopRequireDefault(require('./bind'));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

/**
 * This utility facilitates parameterized testing by allowing users to create
 * test cases that vary by input data. It supports the main test functions and
 * their variants like `skip`, `only`, and `concurrent`.
 */

const install = (globalObj, table, ...data) => {
  const isArrayBinding = data.length === 0;
  const isTemplateLiteral = Array.isArray(table) && !!table.raw;

  if (!isArrayBinding && !isTemplateLiteral) {
    throw new Error(
      '`.each` must only be called with an Array or Tagged Template Literal.'
    );
  }

  const testFunctions = {
    test: constructTest(globalObj.test),
    describe: constructTest(globalObj.describe, false),
    it: constructTest(globalObj.it),
    xit: _bind.default(globalObj.xit)(table, ...data),
    fit: _bind.default(globalObj.fit)(table, ...data),
    xtest: _bind.default(globalObj.xtest)(table, ...data),
    fdescribe: _bind.default(globalObj.fdescribe, false)(table, ...data),
    xdescribe: _bind.default(globalObj.xdescribe, false)(table, ...data)
  };

  testFunctions.testConcurrent = constructTest(
    globalObj.test.concurrent
  );

  setSpecialTestMethods(testFunctions);
  
  return testFunctions;

  function constructTest(mainFunction, defaultBind = true) {
    const boundFunction = _bind.default(mainFunction, defaultBind)(table, ...data);
    const skipFunction = _bind.default(mainFunction.skip, defaultBind)(table, ...data);
    const onlyFunction = _bind.default(mainFunction.only, defaultBind)(table, ...data);
    const testFunction = (title, testCase, timeout) => boundFunction(title, testCase, timeout);
    testFunction.skip = skipFunction;
    testFunction.only = onlyFunction;
    return testFunction;
  }

  function setSpecialTestMethods(testFunctions) {
    const concurrentMethods = testFunctions.testConcurrent;
    const concurrentOptions = ['only', 'skip'];

    for (let option of concurrentOptions) {
      concurrentMethods[option] = _bind.default(globalObj.test.concurrent[option])(table, ...data);
    }

    ['it', 'describe'].forEach(method => {
      testFunctions[method].concurrent = testFunctions.testConcurrent;
    });
  }
};

const each = (table, ...data) => install(globalThis, table, ...data);

each.withGlobal = globalObj => (table, ...data) => install(globalObj, table, ...data);

exports.default = each;

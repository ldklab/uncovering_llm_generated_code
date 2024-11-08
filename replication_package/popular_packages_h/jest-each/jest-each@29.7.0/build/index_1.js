'use strict';

import _bind from './bind';

/**
 * Handle setup of parameterized tests with various global testing functions.
 */
const install = (g, table, ...data) => {
  const isArrayBinding = data.length === 0;
  const isTemplateBinding = Array.isArray(table) && !!table.raw;
  
  if (!isArrayBinding && !isTemplateBinding) {
    throw new Error('`.each` must only be called with an Array or Tagged Template Literal.');
  }

  const createTest = (methodName) => (title, test, timeout) => 
    _bind(g[methodName])(table, ...data)(title, test, timeout);

  const test = createTest('test');
  test.skip = _bind(g.test.skip)(table, ...data);
  test.only = _bind(g.test.only)(table, ...data);
  
  const testConcurrent = createTest('test.concurrent');
  testConcurrent.only = _bind(g.test.concurrent.only)(table, ...data);
  testConcurrent.skip = _bind(g.test.concurrent.skip)(table, ...data);
  
  test.concurrent = testConcurrent;

  const it = createTest('it');
  it.skip = _bind(g.it.skip)(table, ...data);
  it.only = _bind(g.it.only)(table, ...data);
  it.concurrent = testConcurrent;

  const descriptionTest = (title, suite, timeout) => 
    _bind(g.describe, false)(table, ...data)(title, suite, timeout);
  
  const describe = descriptionTest;
  describe.skip = _bind(g.describe.skip, false)(table, ...data);
  describe.only = _bind(g.describe.only, false)(table, ...data);
  
  const otherMethods = {
    xit: _bind(g.xit)(table, ...data),
    fit: _bind(g.fit)(table, ...data),
    xtest: _bind(g.xtest)(table, ...data),
    fdescribe: _bind(g.fdescribe, false)(table, ...data),
    xdescribe: _bind(g.xdescribe, false)(table, ...data),
  }

  return {
    describe,
    it,
    test,
    ...otherMethods
  };
};

// Main export function to each global for setting up parameterized tests
const each = (table, ...data) => install(globalThis, table, ...data);

each.withGlobal = g => (table, ...data) => install(g, table, ...data);

export default each;

// jest-each.js

const { format } = require('util');

// Formats the test title using provided arguments
function formatTitle(title, args) {
  return format.apply(null, [title, ...args]);
}

// Executes test cases with given parameters and a specific test executor function
function executeTestCases(name, testFn, params, testExecutor) {
  params.forEach((args, index) => {
    // Construct a test name with printf-style formatting
    const testName = formatTitle(name, args);
    testExecutor(testName, () => testFn(...args));
  });
}

// Core function to generate tests from parameterized inputs
function each(params) {
  if (!Array.isArray(params)) {
    throw new Error('Parameter should be an array');
  }

  function test(name, testFn) {
    executeTestCases(name, testFn, params, global.test);
  }

  test.only = function(name, testFn) {
    executeTestCases(name, testFn, params, global.test.only);
  };

  test.skip = function(name, testFn) {
    executeTestCases(name, testFn, params, global.test.skip);
  };

  // For concurrent test execution
  test.concurrent = function(name, testFn) {
    executeTestCases(name, testFn, params, global.test.concurrent);
  };
  
  test.concurrent.only = function(name, testFn) {
    executeTestCases(name, testFn, params, global.test.concurrent.only);
  };

  test.concurrent.skip = function(name, testFn) {
    executeTestCases(name, testFn, params, global.test.concurrent.skip);
  };

  test.it = test;
  test.fit = test.only;
  test.xit = test.skip;

  function describe(name, suiteFn) {
    params.forEach((args) => {
      const suiteName = formatTitle(name, args);
      global.describe(suiteName, () => suiteFn(...args));
    });
  }
  
  describe.only = function(name, suiteFn) {
    params.forEach((args) => {
      const suiteName = formatTitle(name, args);
      global.describe.only(suiteName, () => suiteFn(...args));
    });
  };

  describe.skip = function(name, suiteFn) {
    params.forEach((args) => {
      const suiteName = formatTitle(name, args);
      global.describe.skip(suiteName, () => suiteFn(...args));
    });
  };

  return {
    test,
    describe,
  };
}

// Support for tagged template strings to parse parameters
function taggedEach(strings, ...expressions) {
  const [header, ...rows] = strings[0].split('\n').map(s => s.trim()).filter(Boolean);
  const headers = header.split('|').map(h => h.trim());

  const params = rows.map(row => {
    const values = row.split('|').map(r => r.trim());
    const paramObj = {};
    headers.forEach((header, index) => {
      paramObj[header] = expressions[index] ? expressions[index](values[index]) : values[index];
    });
    return paramObj;
  });

  return each(params);
}

each.only = taggedEach;

module.exports = each;

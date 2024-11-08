// jest-each.js

const { format } = require('util');

// Helper function to format test titles using printf-style
function formatTitle(title, args) {
  return format.apply(null, [title, ...args]);
}

// Function to execute test cases with provided names, test functions, parameters, and a test executor
function executeTestCases(name, testFn, params, testExecutor) {
  params.forEach((args) => {
    const testName = formatTitle(name, args);
    testExecutor(testName, () => testFn(...args));
  });
}

// Main function 'each' for parameterized tests
function each(params) {
  if (!Array.isArray(params)) {
    throw new Error('Parameter should be an array');
  }

  // Function to describe the tests
  function test(name, testFn) {
    executeTestCases(name, testFn, params, global.test);
  }

  // Adding methods for exclusive, skipped, and concurrent tests
  test.only = (name, testFn) => executeTestCases(name, testFn, params, global.test.only);
  test.skip = (name, testFn) => executeTestCases(name, testFn, params, global.test.skip);
  test.concurrent = (name, testFn) => executeTestCases(name, testFn, params, global.test.concurrent);
  test.concurrent.only = (name, testFn) => executeTestCases(name, testFn, params, global.test.concurrent.only);
  test.concurrent.skip = (name, testFn) => executeTestCases(name, testFn, params, global.test.concurrent.skip);

  // Aliases for different styles of writing tests
  test.it = test;
  test.fit = test.only;
  test.xit = test.skip;

  // Describe function for test suites
  function describe(name, suiteFn) {
    params.forEach((args) => {
      const suiteName = formatTitle(name, args);
      global.describe(suiteName, () => suiteFn(...args));
    });
  }

  // Methods for exclusive and skipped test suites
  describe.only = (name, suiteFn) => params.forEach((args) => {
    const suiteName = formatTitle(name, args);
    global.describe.only(suiteName, () => suiteFn(...args));
  });

  describe.skip = (name, suiteFn) => params.forEach((args) => {
    const suiteName = formatTitle(name, args);
    global.describe.skip(suiteName, () => suiteFn(...args));
  });

  return { test, describe };
}

// Function to handle tagged templates for parameterized tests
function taggedEach(strings, ...expressions) {
  const [header, ...rows] = strings[0].split('\n').map(s => s.trim()).filter(Boolean);
  const headers = header.split('|').map(h => h.trim());
  const params = rows.map(row => {
    const values = row.split('|').map(r => r.trim());
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = expressions[i] ? expressions[i](values[i]) : values[i];
    });
    return obj;
  });

  return each(params);
}

each.only = taggedEach;
module.exports = each;

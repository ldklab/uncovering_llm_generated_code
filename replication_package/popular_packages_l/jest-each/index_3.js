const { format } = require('util');

// Format test titles with given args
function formatTitle(title, args) {
  return format(title, ...args);
}

// Execute test scenarios with parameters
function executeTestCases(name, testFn, params, executor) {
  params.forEach((args) => {
    const testTitle = formatTitle(name, args);
    executor(testTitle, () => testFn(...args));
  });
}

// Main parameterization function
function each(params) {
  if (!Array.isArray(params)) {
    throw new Error('Parameter should be an array');
  }

  const test = (name, testFn) => executeTestCases(name, testFn, params, global.test);
  test.only = (name, testFn) => executeTestCases(name, testFn, params, global.test.only);
  test.skip = (name, testFn) => executeTestCases(name, testFn, params, global.test.skip);
  test.concurrent = (name, testFn) => executeTestCases(name, testFn, params, global.test.concurrent);
  test.concurrent.only = (name, testFn) => executeTestCases(name, testFn, params, global.test.concurrent.only);
  test.concurrent.skip = (name, testFn) => executeTestCases(name, testFn, params, global.test.concurrent.skip);
  
  const describe = (name, suiteFn) => {
    params.forEach((args) => {
      const describeTitle = formatTitle(name, args);
      global.describe(describeTitle, () => suiteFn(...args));
    });
  };
  describe.only = (name, suiteFn) => {
    params.forEach((args) => {
      const describeTitle = formatTitle(name, args);
      global.describe.only(describeTitle, () => suiteFn(...args));
    });
  };
  describe.skip = (name, suiteFn) => {
    params.forEach((args) => {
      const describeTitle = formatTitle(name, args);
      global.describe.skip(describeTitle, () => suiteFn(...args));
    });
  };

  return { test, describe };
}

// Support for tagged template literals
function taggedEach(strings, ...expressions) {
  const [header, ...rows] = strings[0].split('\n').map(s => s.trim()).filter(Boolean);
  const headers = header.split('|').map(h => h.trim());
  const params = rows.map(row => {
    const values = row.split('|').map(r => r.trim());
    return headers.reduce((obj, h, i) => {
      obj[h] = expressions[i] ? expressions[i](values[i]) : values[i];
      return obj;
    }, {});
  });

  return each(params);
}

each.only = taggedEach;
module.exports = each;

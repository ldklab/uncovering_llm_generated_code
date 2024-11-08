'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const _bind = require('./bind');
const defaultBind = _bind.default; // Assuming _bind is a module that exports a default function

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

// Basic functionality to install data-driven test functions.
const install = (g, table, ...data) => {
  const bindingWithArray = data.length === 0;
  const bindingWithTemplate = Array.isArray(table) && !!table.raw;

  if (!bindingWithArray && !bindingWithTemplate) {
    throw new Error('`.each` must only be called with an Array or Tagged Template Literal.');
  }

  const bindTestFunction = (fn) => (0, defaultBind)((g[fn])(table, ...data));

  const test = (title, testFn, timeout) => bindTestFunction('test')(title, testFn, timeout);
  test.skip = bindTestFunction('test.skip');
  test.only = bindTestFunction('test.only');

  const testConcurrent = (title, testFn, timeout) => bindTestFunction('test.concurrent')(title, testFn, timeout);
  test.concurrent = testConcurrent;
  testConcurrent.only = bindTestFunction('test.concurrent.only');
  testConcurrent.skip = bindTestFunction('test.concurrent.skip');

  const it = (title, testFn, timeout) => bindTestFunction('it')(title, testFn, timeout);
  it.skip = bindTestFunction('it.skip');
  it.only = bindTestFunction('it.only');
  it.concurrent = testConcurrent;

  const xit = bindTestFunction('xit');
  const fit = bindTestFunction('fit');
  const xtest = bindTestFunction('xtest');

  const describe = (title, suite, timeout) => bindTestFunction('describe')(title, suite, timeout);
  describe.skip = bindTestFunction('describe.skip');
  describe.only = bindTestFunction('describe.only');

  const fdescribe = bindTestFunction('fdescribe');
  const xdescribe = bindTestFunction('xdescribe');

  return { describe, fdescribe, fit, it, test, xdescribe, xit, xtest };
};

const each = (table, ...data) => install(global, table, ...data);

each.withGlobal = (g) => (table, ...data) => install(g, table, ...data);

exports.default = each;
exports.bind = defaultBind; // Re-export the `bind` function

// index.js

const coreModules = {
  'fs': true,
  'path': true,
  'http': true,
  'crypto': true,
  // Add more core modules as needed
};

/**
 * Checks if the provided module name is a Node.js core module.
 *
 * @param {string} moduleName - Name of the module to check.
 * @param {string} [nodeVersion] - Optional Node.js version (not used currently).
 * @returns {boolean} true if it's a core module, false otherwise.
 */
function isCore(moduleName, nodeVersion) {
  return !!coreModules[moduleName];
}

module.exports = isCore;

// test/index.test.js

const assert = require('assert');
const isCore = require('../index');

describe('is-core-module', function() {
  it('should return true for core modules', function() {
    assert.strictEqual(isCore('fs'), true);
    assert.strictEqual(isCore('path'), true);
    // Add more assertions for known core modules
  });

  it('should return false for non-core modules', function() {
    assert.strictEqual(isCore('butts'), false);
    assert.strictEqual(isCore('some-random-module'), false);
  });
});

// package.json

{
  "name": "is-core-module",
  "version": "1.0.0",
  "description": "Check if a specifier is a Node.js core module.",
  "main": "index.js",
  "scripts": {
    "test": "mocha"
  },
  "devDependencies": {
    "mocha": "^10.2.0"
  },
  "author": "Author Name",
  "license": "MIT"
}

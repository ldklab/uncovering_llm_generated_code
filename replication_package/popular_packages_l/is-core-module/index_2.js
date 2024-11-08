// is-core-module/index.js

const coreModules = {
  // List of core modules Node.js supports.
  'fs': true,
  'path': true,
  'http': true,
  'crypto': true,
  // Add more core modules as needed
};

/**
 * Determines if a given specifier is a core module in Node.js.
 *
 * @param {string} moduleName - The name of the module to check.
 * @param {string} [nodeVersion] - Optional Node.js version to check against.
 * @returns {boolean} - Returns true if the module is a core module, otherwise false.
 */
function isCore(moduleName, nodeVersion) {
  // The nodeVersion argument can be used to customize behavior based on specific versions if needed
  return !!coreModules[moduleName];
}

module.exports = isCore;

// is-core-module/test/index.test.js

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

// package.json for the project configuration

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

// is-core-module/index.js

const coreModules = {
  // List of core modules Node.js supports.
  'fs': true,
  'path': true,
  'http': true,
  'crypto': true,
  // Additional core modules can be added here
};

/**
 * Determines if a given specifier is a core module in Node.js.
 *
 * @param {string} moduleName - The name of the module to check.
 * @param {string} [nodeVersion] - Optional Node.js version to check against.
 * @returns {boolean} - Returns true if the module is a core module, otherwise false.
 */
function isCore(moduleName, nodeVersion) {
  // This function checks if a module is part of Node.js core by looking up its name
  // The nodeVersion parameter is available for future use, if checking by version is required
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
    // Add more assertions for known core modules if necessary
  });

  it('should return false for non-core modules', function() {
    assert.strictEqual(isCore('butts'), false);
    assert.strictEqual(isCore('some-random-module'), false);
  });
});

// To Test the Functionality
// After cloning the repository
// Run the following in the terminal
// $ npm install
// $ npm test

// package.json (for completeness)

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

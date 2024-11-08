// index.js
'use strict';

const semver = require('semver');

const supportsPreserveSymlinksFlag = (() => {
    // Check if the code is running in a Node.js environment
    if (typeof process === 'undefined' || !process.version) {
        return null;
    }
    
    // The `--preserve-symlinks` flag was introduced in Node.js v6.2.0
    return semver.gte(process.version, '6.2.0');
})();

module.exports = supportsPreserveSymlinksFlag;

// test.js
const assert = require('assert');
const supportsPreserveSymlinksFlag = require('./index');

// Adjust these assertions based on the current Node.js version
assert.strictEqual(supportsPreserveSymlinksFlag, process.version && semver.gte(process.version, '6.2.0'));

// package.json
{
    "name": "node-supports-preserve-symlinks-flag",
    "version": "1.0.0",
    "main": "index.js",
    "scripts": {
        "test": "node test.js"
    },
    "devDependencies": {
        "semver": "^7.3.5"
    }
}

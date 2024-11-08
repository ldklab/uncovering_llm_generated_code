// index.js
'use strict';

var semver = require('semver');

var supportsPreserveSymlinksFlag = (function () {
    // Check if the code is running in a browser
    if (typeof process === 'undefined' || !process || typeof process.version !== 'string') {
        return null;
    }
    
    // The `--preserve-symlinks` flag was introduced in Node.js v6.2.0
    var nodeVersion = process.version;
    return semver.gte(nodeVersion, '6.2.0');
})();

module.exports = supportsPreserveSymlinksFlag;

// test.js
var assert = require('assert');
var supportsPreserveSymlinksFlag = require('./index');

// Here, you should adjust these assertions based on your Node.js version during testing
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

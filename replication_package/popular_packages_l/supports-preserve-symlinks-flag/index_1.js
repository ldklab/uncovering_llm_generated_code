// index.js
'use strict';

const semver = require('semver');

const supportsPreserveSymlinksFlag = (() => {
    if (typeof process === 'undefined' || !process || typeof process.version !== 'string') {
        return null;
    }
    
    const nodeVersion = process.version;
    return semver.gte(nodeVersion, '6.2.0');
})();

module.exports = supportsPreserveSymlinksFlag;

// test.js
const assert = require('assert');
const supportsPreserveSymlinksFlag = require('./index');

// Ensure this test aligns with your Node.js version
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

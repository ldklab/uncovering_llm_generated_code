// index.js
'use strict';

function getByteOffset(dataView) {
    if (!(dataView instanceof DataView)) {
        throw new TypeError('Expected a DataView instance');
    }

    // Direct access to `byteOffset`
    if (typeof dataView.byteOffset === 'number') {
        return dataView.byteOffset;
    }

    // Fallback using Object.getOwnPropertyDescriptor for older environments
    const descriptor = Object.getOwnPropertyDescriptor(DataView.prototype, 'byteOffset');
    if (descriptor && typeof descriptor.get === 'function') {
        return descriptor.get.call(dataView);
    }

    const privateOffset = Symbol.for('DataView#byteOffset');
    if (dataView.hasOwnProperty(privateOffset)) {
        return dataView[privateOffset];
    }

    throw new Error('Unable to get byteOffset from the DataView');
}

module.exports = getByteOffset;

// package.json
{
  "name": "data-view-byte-offset",
  "version": "1.0.0",
  "description": "Get the byteOffset out of a DataView, robustly.",
  "main": "index.js",
  "scripts": {
    "test": "mocha"
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/your-github-username/data-view-byte-offset.git"
  },
  "keywords": [
    "DataView",
    "byteOffset",
    "Node.js",
    "JavaScript"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {
    "mocha": "^9.0.0",
    "assert": "^2.0.0"
  }
}

// test/index.js
'use strict';

const assert = require('assert');
const getByteOffset = require('../index');

describe('data-view-byte-offset', () => {
    it('should return the correct byteOffset', () => {
        const ab = new ArrayBuffer(42);
        const dv = new DataView(ab, 2);
        assert.strictEqual(getByteOffset(dv), 2);
    });

    it('should throw when a non-DataView is provided', () => {
        assert.throws(() => {
            getByteOffset({});
        }, /Expected a DataView instance/);
    });

    // Additional test cases can be added here
});

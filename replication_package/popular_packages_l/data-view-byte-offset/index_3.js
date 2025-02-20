// index.js
'use strict';

function getByteOffset(dataView) {
    if (!(dataView instanceof DataView)) {
        throw new TypeError('Expected a DataView instance');
    }

    // Attempt to directly access the byteOffset property
    if (typeof dataView.byteOffset === 'number') {
        return dataView.byteOffset;
    }

    // Use Object.getOwnPropertyDescriptor to access the getter for byteOffset
    const descriptor = Object.getOwnPropertyDescriptor(DataView.prototype, 'byteOffset');
    if (descriptor && typeof descriptor.get === 'function') {
        return descriptor.get.call(dataView);
    }

    // Use a symbol for private properties when versions where byteOffset might be non-standard
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
const dataViewByteOffset = require('../index');

describe('data-view-byte-offset', function () {
    it('should return the correct byteOffset', function () {
        const ab = new ArrayBuffer(42);
        const dv = new DataView(ab, 2);
        assert.strictEqual(dataViewByteOffset(dv), 2);
    });

    it('should throw when a non-DataView is provided', function () {
        assert.throws(() => {
            dataViewByteOffset({});
        }, /Expected a DataView instance/);
    });

    // Additional tests can be added here
});

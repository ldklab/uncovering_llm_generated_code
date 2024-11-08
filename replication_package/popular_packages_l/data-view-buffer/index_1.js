// data-view-buffer/index.js
/**
 * This function attempts to retrieve the ArrayBuffer associated with a given DataView.
 * It first checks if the input is a DataView. Then, it attempts to access the buffer
 * in a standard way using DataView.prototype.buffer. If this isn't possible, it tries
 * to directly access the getter function for environments where the standard property might be unavailable.
 * @param {DataView} dv - The DataView instance from which to retrieve the buffer.
 * @returns {ArrayBuffer} The underlying ArrayBuffer of the DataView.
 * @throws {TypeError} If the argument is not a DataView.
 * @throws {Error} If the buffer cannot be retrieved.
 */
module.exports = function dataViewBuffer(dv) {
  if (!(dv instanceof DataView)) {
    throw new TypeError('Argument must be a DataView');
  }

  // Standard access to the buffer
  if (typeof DataView.prototype.buffer !== 'undefined') {
    return dv.buffer;
  }

  // Non-standard environments handling
  try {
    const bufferGetter = Object.getOwnPropertyDescriptor(DataView.prototype, 'buffer').get;
    return bufferGetter.call(dv);
  } catch (e) {
    throw new Error('Unable to retrieve buffer from DataView');
  }
};

// test/index.js
const assert = require('assert');
const dataViewBuffer = require('../index');

describe('data-view-buffer', function () {
  it('should return the correct ArrayBuffer from a DataView', function () {
    const ab = new ArrayBuffer(8);
    const dv = new DataView(ab);
    assert.strictEqual(dataViewBuffer(dv), ab);
  });

  it('should throw if the argument is not a DataView', function () {
    assert.throws(() => dataViewBuffer({}), TypeError);
    assert.throws(() => dataViewBuffer(null), TypeError);
    assert.throws(() => dataViewBuffer(), TypeError);
  });

  it('should throw an error if the buffer cannot be retrieved', function () {
    const originalGetter = Object.getOwnPropertyDescriptor(DataView.prototype, 'buffer');
    Object.defineProperty(DataView.prototype, 'buffer', { get: undefined }); // Simulate deletion

    try {
      const ab = new ArrayBuffer(8);
      const dv = new DataView(ab);
      assert.throws(() => dataViewBuffer(dv), Error);
    } finally {
      // Restore the original getter to maintain integrity in the environment
      Object.defineProperty(DataView.prototype, 'buffer', originalGetter);
    }
  });
});

// package.json
{
  "name": "data-view-buffer",
  "version": "1.0.0",
  "description": "Get the ArrayBuffer out of a DataView, robustly.",
  "main": "index.js",
  "scripts": {
    "test": "mocha"
  },
  "devDependencies": {
    "mocha": "^10.0.0", 
    "assert": "^1.5.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/ljharb/data-view-buffer.git"
  },
  "keywords": [
    "dataview",
    "arraybuffer",
    "buffer"
  ],
  "author": "ljharb",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/ljharb/data-view-buffer/issues"
  },
  "homepage": "https://github.com/ljharb/data-view-buffer#readme"
}

'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = void 0;

const util = require('util');
const v8 = require('v8');
const vm = require('vm');
const jestGetType = require('jest-get-type');
const prettyFormat = require('pretty-format').default;

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}

const tick = util.promisify(setImmediate);

class LeakingDetector {
  constructor(value) {
    _defineProperty(this, '_isReferenceBeingHeld', void 0);

    if (jestGetType.isPrimitive(value)) {
      throw new TypeError(
        `Primitives cannot leak memory. You passed a ${typeof value}: <${prettyFormat(value)}>`
      );
    }

    let weak;

    try {
      weak = require('weak-napi');
    } catch (err) {
      if (!err || err.code !== 'MODULE_NOT_FOUND') {
        throw err;
      }

      throw new Error(
        'The leaking detection mechanism requires the "weak-napi" package to be installed. ' +
        'Please install it as a dependency on your main project'
      );
    }

    weak(value, () => (this._isReferenceBeingHeld = false));
    this._isReferenceBeingHeld = true;

    // Ensure the value is not leaked by the closure.
    value = null;
  }

  async isLeaking() {
    this._runGarbageCollector();

    for (let i = 0; i < 10; i++) {
      await tick();
    }

    return this._isReferenceBeingHeld;
  }

  _runGarbageCollector() {
    const gcExposed = !!global.gc;

    v8.setFlagsFromString('--expose-gc');
    vm.runInNewContext('gc')();

    if (!gcExposed) {
      v8.setFlagsFromString('--no-expose-gc');
    }
  }
}

exports.default = LeakingDetector;

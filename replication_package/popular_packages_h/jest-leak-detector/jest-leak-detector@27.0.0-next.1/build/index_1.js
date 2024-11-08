'use strict';

const util = require('util');
const v8 = require('v8');
const vm = require('vm');
const { isPrimitive } = require('jest-get-type');
const prettyFormat = require('pretty-format').default;

const tick = util.promisify(setImmediate);

class MemoryLeakDetector {
  constructor(value) {
    this._isReferenceBeingHeld = undefined;

    if (isPrimitive(value)) {
      throw new TypeError(
        `Primitives cannot leak memory. You passed a ${typeof value}: <${prettyFormat(value)}>`
      );
    }

    let weak;
    try {
      weak = require('weak-napi');
    } catch (err) {
      if (!err || err.code !== 'MODULE_NOT_FOUND') throw err;

      throw new Error(
        'The leaking detection mechanism requires the "weak-napi" package to be installed and work. Please install it as a dependency on your main project'
      );
    }

    weak(value, () => (this._isReferenceBeingHeld = false));
    this._isReferenceBeingHeld = true;
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
    const wasGarbageCollectorHidden = !global.gc;

    v8.setFlagsFromString('--expose-gc');
    vm.runInNewContext('gc')();

    if (wasGarbageCollectorHidden) {
      v8.setFlagsFromString('--no-expose-gc');
    }
  }
}

module.exports.default = MemoryLeakDetector;

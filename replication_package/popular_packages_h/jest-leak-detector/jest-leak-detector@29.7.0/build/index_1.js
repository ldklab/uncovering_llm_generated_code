'use strict';

const util = require('util');
const v8 = require('v8');
const vm = require('vm');
const { isPrimitive } = require('jest-get-type');
const { format } = require('pretty-format');

const tick = util.promisify(setImmediate);

class LeakDetector {
  constructor(value) {
    if (isPrimitive(value)) {
      throw new TypeError(
        `Primitives cannot leak memory. You passed a ${typeof value}: <${format(value)}>`
      );
    }
    
    this._isReferenceBeingHeld = true;
    this._finalizationRegistry = new FinalizationRegistry(() => {
      this._isReferenceBeingHeld = false;
    });
    
    this._finalizationRegistry.register(value, undefined);
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
    const isGCHidden = globalThis.gc == null;

    v8.setFlagsFromString('--expose-gc');
    vm.runInNewContext('gc')();

    if (isGCHidden) {
      v8.setFlagsFromString('--no-expose-gc');
    }
  }
}

module.exports = LeakDetector;

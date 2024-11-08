'use strict';

const util = require('util');
const v8 = require('v8');
const vm = require('vm');
const { isPrimitive } = require('jest-get-type');
const { format } = require('pretty-format');

exports.default = class LeakDetector {
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
    value = null; // Ensure no closure holds a reference
  }

  async isLeaking() {
    this._runGarbageCollector();

    const tick = util.promisify(setImmediate);
    for (let i = 0; i < 10; i++) {
      await tick();
    }
    
    return this._isReferenceBeingHeld;
  }

  _runGarbageCollector() {
    const gcWasHidden = !globalThis.gc;
    
    v8.setFlagsFromString('--expose-gc');
    vm.runInNewContext('gc')();

    if (gcWasHidden) {
      v8.setFlagsFromString('--no-expose-gc');
    }
  }
};

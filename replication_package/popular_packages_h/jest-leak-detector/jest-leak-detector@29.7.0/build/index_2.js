'use strict';

const util = require('util');
const v8 = require('v8');
const vm = require('vm');
const jestGetType = require('jest-get-type');
const prettyFormat = require('pretty-format');

const tick = util.promisify(setImmediate);

class LeakDetector {
  _isReferenceBeingHeld;
  _finalizationRegistry;
  
  constructor(value) {
    if (jestGetType.isPrimitive(value)) {
      throw new TypeError(
        `Primitives cannot leak memory. You passed a ${typeof value}: <${prettyFormat.format(value)}>`
      );
    }

    this._finalizationRegistry = new FinalizationRegistry(() => {
      this._isReferenceBeingHeld = false;
    });
    this._finalizationRegistry.register(value, undefined);
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
    const isGarbageCollectorHidden = globalThis.gc == null;

    v8.setFlagsFromString('--expose-gc');
    vm.runInNewContext('gc')();

    if (isGarbageCollectorHidden) {
      v8.setFlagsFromString('--no-expose-gc');
    }
  }
}

module.exports = LeakDetector;

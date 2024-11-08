class LeakDetector {
  weakRef;

  constructor(object) {
    if (typeof object !== 'object' || object === null) {
      throw new TypeError('LeakDetector expects an object reference.');
    }
    this.weakRef = new WeakRef(object);
  }

  async isLeaking() {
    // Force garbage collection in Node.js; note this requires `node --expose-gc`.
    if (global.gc) {
      global.gc();
    } else {
      throw new Error('Garbage collector is not exposed. Run node with --expose-gc.');
    }

    // Allow some time for GC to process
    await new Promise(resolve => setTimeout(resolve, 100));

    // `WeakRef.deref()` returns undefined if the object has been collected
    return this.weakRef.deref() !== undefined;
  }
}

(async function () {
  let reference = {};
  let isLeaking;

  const detector = new LeakDetector(reference);

  // Reference is held in memory.
  isLeaking = await detector.isLeaking();
  console.log(isLeaking); // true

  // We destroy the only reference to the object.
  reference = null;

  // Reference is gone.
  isLeaking = await detector.isLeaking();
  console.log(isLeaking); // false
})();

class LeakDetector {
  weakRef;

  constructor(object) {
    if (typeof object !== 'object' || object === null) {
      throw new TypeError('LeakDetector expects an object reference.');
    }
    this.weakRef = new WeakRef(object);
  }

  async isLeaking() {
    // Attempt to trigger garbage collection if it's available
    if (global.gc) {
      global.gc();
    } else {
      throw new Error('Garbage collector is not exposed. Run node with --expose-gc.');
    }

    // Wait briefly to allow garbage collection to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the object still exists
    return this.weakRef.deref() !== undefined;
  }
}

(async function () {
  let referenceObject = {};
  let isStillLeaking;

  const leakDetector = new LeakDetector(referenceObject);

  // Check if the object is still in memory
  isStillLeaking = await leakDetector.isLeaking();
  console.log(isStillLeaking); // true

  // Remove the only reference to the object
  referenceObject = null;

  // Check if the object has been collected
  isStillLeaking = await leakDetector.isLeaking();
  console.log(isStillLeaking); // false
})();

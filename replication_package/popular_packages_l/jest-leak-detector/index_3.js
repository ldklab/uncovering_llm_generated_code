class LeakDetector {
  weakReference;

  constructor(obj) {
    if (typeof obj !== 'object' || obj === null) {
      throw new TypeError('LeakDetector expects a valid object reference.');
    }
    this.weakReference = new WeakRef(obj);
  }

  async hasMemoryLeak() {
    // Check if garbage collector is exposed and force garbage collection
    if (typeof global.gc === 'function') {
      global.gc();
    } else {
      throw new Error('Garbage collector is not exposed. Use node with --expose-gc.');
    }

    // Wait briefly to allow garbage collection to take place
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the object referenced by WeakRef is still in memory
    return this.weakReference.deref() !== undefined;
  }
}

(async function () {
  let obj = {};
  const detector = new LeakDetector(obj);

  // While the reference is active in memory
  let hasLeak = await detector.hasMemoryLeak();
  console.log(hasLeak); // Should log true as object is still referenced

  // Remove the only strong reference to the object.
  obj = null;

  // Perform the leak check again after removing the strong reference
  hasLeak = await detector.hasMemoryLeak();
  console.log(hasLeak); // Should log false as object has been collected
})();

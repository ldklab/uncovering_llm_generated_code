class LeakDetector {
  #weakReference;

  constructor(obj) {
    if (typeof obj !== 'object' || obj === null) {
      throw new TypeError('LeakDetector requires an object reference.');
    }
    this.#weakReference = new WeakRef(obj);
  }

  async isLeaking() {
    // Enforce garbage collection explicitly; needs Node.js run with --expose-gc.
    if (!global.gc) {
      throw new Error('Garbage collection is not exposed. Use node with the --expose-gc flag.');
    }
    global.gc();

    // Pause to allow time for garbage collection.
    await new Promise(res => setTimeout(res, 100));

    // Check if the object is still accessible.
    return this.#weakReference.deref() !== undefined;
  }
}

(async function () {
  let obj = {};
  const leakDetector = new LeakDetector(obj);

  // The object reference is initially maintained.
  let isObjectLeaking = await leakDetector.isLeaking();
  console.log(isObjectLeaking); // Expected output: true

  // Remove the only remaining reference.
  obj = null;

  // Confirm the object is no longer accessible.
  isObjectLeaking = await leakDetector.isLeaking();
  console.log(isObjectLeaking); // Expected output: false
})();

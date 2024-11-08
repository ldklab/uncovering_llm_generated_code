class LeakDetector {
  constructor(object) {
    if (typeof object !== 'object' || object === null) {
      throw new TypeError('LeakDetector expects an object reference.');
    }
    this.weakRef = new WeakRef(object);
  }

  async isLeaking() {
    // Check if the global garbage collector is exposed and trigger it if possible
    if (global.gc) {
      global.gc();
    } else {
      throw new Error('Garbage collector is not exposed. Run node with --expose-gc.');
    }

    // Wait for some time to let garbage collection complete
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if the object is still reachable through the WeakRef
    return this.weakRef.deref() !== undefined;
  }
}

(async function () {
  let reference = {}; // Create an object reference
  const detector = new LeakDetector(reference); // Initialize LeakDetector with the object

  // Check if object is still referenced (should be true)
  let isLeaking = await detector.isLeaking();
  console.log(isLeaking); // Expected output: true
  
  // Remove the reference to the object
  reference = null;

  // Check if object is no longer referenced (should be false)
  isLeaking = await detector.isLeaking();
  console.log(isLeaking); // Expected output: false
})();

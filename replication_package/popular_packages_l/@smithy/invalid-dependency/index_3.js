// index.js for the @smithy/invalid-dependency package

module.exports = (() => {
  const internalState = {
    initialized: false,
    data: null,
  };

  const initialize = () => {
    if (!internalState.initialized) {
      internalState.data = Math.random();
      internalState.initialized = true;
      console.log("Package initialized with data:", internalState.data);
    }
  };

  const getInternalData = () => {
    if (!internalState.initialized) {
      throw new Error("Package not initialized. Call initialize() first.");
    }
    return internalState.data;
  };

  const reset = () => {
    internalState.initialized = false;
    internalState.data = null;
    console.log("Package has been reset.");
  };

  // Public API
  return {
    initialize,
    getInternalData,
    reset,
  };
})();

// Sample usage (not recommended directly, per the README)
if (require.main === module) {
  try {
    module.exports.initialize();
    console.log("Current data:", module.exports.getInternalData());
    module.exports.reset();
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

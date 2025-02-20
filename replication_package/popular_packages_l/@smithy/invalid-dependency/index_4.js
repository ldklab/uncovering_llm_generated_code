// index.js for the @smithy/invalid-dependency package

module.exports = (() => {
  const state = {
    initialized: false,
    data: null,
  };

  const initialize = () => {
    if (!state.initialized) {
      state.data = Math.random();
      state.initialized = true;
      console.log("Package initialized with data:", state.data);
    }
  };

  const getData = () => {
    if (!state.initialized) {
      throw new Error("Package not initialized. Call initialize() first.");
    }
    return state.data;
  };

  const reset = () => {
    state.initialized = false;
    state.data = null;
    console.log("Package has been reset.");
  };

  return {
    initialize,
    getData,
    reset,
  };
})();

// Sample usage
if (require.main === module) {
  try {
    module.exports.initialize();
    console.log("Current data:", module.exports.getData());
    module.exports.reset();
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

// index.js for the @smithy/invalid-dependency package

module.exports = (() => {
  // Private internal state not directly accessible from outside
  const internalState = {
    initialized: false,
    data: null,
  };

  // Function to initialize the package
  const initialize = () => {
    if (!internalState.initialized) {
      internalState.data = Math.random(); // Generates random data
      internalState.initialized = true;
      console.log("Package initialized with data:", internalState.data);
    }
  };

  // Function to retrieve internal data after initialization
  const getInternalData = () => {
    if (!internalState.initialized) {
      throw new Error("Package not initialized. Call initialize() first.");
    }
    return internalState.data;
  };

  // Function to reset the internal state of the package
  const reset = () => {
    internalState.initialized = false;
    internalState.data = null;
    console.log("Package has been reset.");
  };

  // Returning the public API for external usage
  return {
    initialize,
    getInternalData,
    reset,
  };
})();

// Example usage of the package when this module is executed directly
if (require.main === module) {
  try {
    module.exports.initialize(); // Initializes the package
    console.log("Current data:", module.exports.getInternalData()); // Retrieves initialized data
    module.exports.reset(); // Resets the package state
  } catch (error) {
    console.error("An error occurred:", error.message); // Catches and logs any errors
  }
}

// index.js

class DefaultsModeManager {
  constructor() {
    // Container for storing default mode values
    this.defaultModes = new Map();
  }

  /**
   * Set a new default mode.
   * @param {string} modeKey - Identifier for the mode.
   * @param {*} modeValue - The default value for the mode.
   */
  setMode(modeKey, modeValue) {
    this.defaultModes.set(modeKey, modeValue);
  }

  /**
   * Retrieve the specified default mode.
   * @param {string} modeKey - Identifier for the mode to retrieve.
   * @returns {*} - The stored value for the specified mode.
   */
  getMode(modeKey) {
    return this.defaultModes.get(modeKey);
  }

  /**
   * Clear all stored default modes, resetting to an initial state.
   */
  clearModes() {
    this.defaultModes.clear();
  }
}

// Example Usage
// Example purposes only, not meant for production use as per documentation guidelines.
const modeManager = new DefaultsModeManager();
modeManager.setMode('mode1', 'default-value');
console.log(modeManager.getMode('mode1')); // Expected output: 'default-value'
modeManager.clearModes();
console.log(modeManager.getMode('mode1')); // Expected output: undefined

module.exports = DefaultsModeManager;

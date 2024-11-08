// index.js

class DefaultsManager {
  constructor() {
    // Initialize a map to store default modes and their corresponding settings
    this.defaultModes = new Map();
  }

  /**
   * Assigns a default mode to a specific key.
   * @param {string} key - The identifier for the mode.
   * @param {*} value - The value representing the default mode.
   */
  setDefault(key, value) {
    this.defaultModes.set(key, value);
  }

  /**
   * Retrieves the default mode associated with a given key.
   * @param {string} key - The identifier for the mode.
   * @returns {*} - The value of the default mode, if it exists.
   */
  getDefault(key) {
    return this.defaultModes.get(key);
  }

  /**
   * Clears all default modes, resetting to an initial empty state.
   */
  reset() {
    this.defaultModes.clear();
  }
}

// Demonstrative Usage (for illustrative purposes, not for direct application as per documentation)
const defaultsManager = new DefaultsManager();
defaultsManager.setDefault('mode1', 'default-value');
console.log(defaultsManager.getDefault('mode1')); // Logs: 'default-value'
defaultsManager.reset();
console.log(defaultsManager.getDefault('mode1')); // Logs: undefined

module.exports = DefaultsManager;

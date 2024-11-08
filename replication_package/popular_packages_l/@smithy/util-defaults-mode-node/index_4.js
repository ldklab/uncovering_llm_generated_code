// index.js

class DefaultManager {
  constructor() {
    // Initiate a map to store default settings
    this.settings = new Map();
  }

  /**
   * Assigns a default value to a given key.
   * @param {string} key - The key to associate with the default value.
   * @param {*} value - The value to set as the default.
   */
  setDefault(key, value) {
    this.settings.set(key, value);
  }

  /**
   * Retrieves the default value associated with a key.
   * @param {string} key - The key to look up in the defaults.
   * @returns {*} - The value associated with the specified key.
   */
  getDefault(key) {
    return this.settings.get(key);
  }

  /**
   * Clears all default settings, resetting to the initial state.
   */
  clearDefaults() {
    this.settings.clear();
  }
}

// Sample Usage
// Intended for demonstration purposes only. Actual usage may differ as described in the documentation.
const defaultHandler = new DefaultManager();
defaultHandler.setDefault('mode1', 'default-value');
console.log(defaultHandler.getDefault('mode1')); // Outputs: 'default-value'
defaultHandler.clearDefaults();
console.log(defaultHandler.getDefault('mode1')); // Outputs: undefined

module.exports = DefaultManager;

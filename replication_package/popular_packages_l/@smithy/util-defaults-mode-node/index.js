markdown
// index.js

class DefaultsModeNode {
  constructor() {
    // Maps to hold default modes and settings
    this.modes = new Map();
  }

  /**
   * Sets a default mode.
   * @param {string} key - The key for the mode.
   * @param {*} value - The default mode to set.
   */
  setDefaultMode(key, value) {
    this.modes.set(key, value);
  }

  /**
   * Gets a default mode.
   * @param {string} key - The key for the mode to retrieve.
   * @returns {*} - The default mode value.
   */
  getDefaultMode(key) {
    return this.modes.get(key);
  }

  /**
   * Resets the defaults to an initial state.
   */
  resetDefaults() {
    this.modes.clear();
  }
}

// Example Usage
// Note: This is for illustration only. As mentioned in the README, this is not intended for direct use.
const defaultsManager = new DefaultsModeNode();
defaultsManager.setDefaultMode('mode1', 'default-value');
console.log(defaultsManager.getDefaultMode('mode1')); // Outputs: 'default-value'
defaultsManager.resetDefaults();
console.log(defaultsManager.getDefaultMode('mode1')); // Outputs: undefined

module.exports = DefaultsModeNode;

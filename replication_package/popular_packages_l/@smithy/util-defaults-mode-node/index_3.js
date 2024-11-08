// settingsManager.js

class SettingsManager {
  constructor() {
    // Store settings in a map.
    this.settings = new Map();
  }

  /**
   * Sets a default setting.
   * @param {string} name - The name of the setting.
   * @param {*} value - The value of the setting.
   */
  setDefaultSetting(name, value) {
    this.settings.set(name, value);
  }

  /**
   * Retrieves a default setting.
   * @param {string} name - The name of the setting to retrieve.
   * @returns {*} - The setting value.
   */
  getDefaultSetting(name) {
    return this.settings.get(name);
  }

  /**
   * Clears all default settings.
   */
  clearSettings() {
    this.settings.clear();
  }
}

// Example Usage
// Note: This code demonstrates how to use the SettingsManager class.
const settingsManager = new SettingsManager();
settingsManager.setDefaultSetting('exampleSetting', 'initial-value');
console.log(settingsManager.getDefaultSetting('exampleSetting')); // Outputs: 'initial-value'
settingsManager.clearSettings();
console.log(settingsManager.getDefaultSetting('exampleSetting')); // Outputs: undefined

module.exports = SettingsManager;

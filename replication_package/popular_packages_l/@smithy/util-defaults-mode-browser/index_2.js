// Default configurations for a browser environment
const defaultConfigs = {
    theme: 'light',
    timeout: 5000,
    language: 'en',
    debugMode: false
};

/**
 * Updates a specified configuration setting if it exists.
 * @param {string} key - The configuration key to update.
 * @param {*} value - The new value for the specified configuration key.
 */
function setDefaultConfig(key, value) {
    if (key in defaultConfigs) {
        defaultConfigs[key] = value;
    } else {
        console.warn(`Config key "${key}" is not recognized.`);
    }
}

/**
 * Retrieves the value of a specified configuration setting.
 * @param {string} key - The configuration key to retrieve.
 * @returns {*} The current value of the specified configuration key.
 */
function getDefaultConfig(key) {
    return defaultConfigs[key];
}

/**
 * Resets all configuration settings to their initial default values.
 */
function resetDefaultConfigs() {
    Object.assign(defaultConfigs, {
        theme: 'light',
        timeout: 5000,
        language: 'en',
        debugMode: false
    });
}

module.exports = {
    setDefaultConfig,
    getDefaultConfig,
    resetDefaultConfigs
};

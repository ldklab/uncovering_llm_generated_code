// Default configurations for a browser environment
const defaultConfigs = {
    theme: 'light',
    timeout: 5000,
    language: 'en',
    debugMode: false
};

/**
 * Updates a specified configuration with a new value.
 * @param {string} key - The name of the configuration to update.
 * @param {*} value - The new value to assign to the configuration.
 */
function setDefaultConfig(key, value) {
    if (defaultConfigs.hasOwnProperty(key)) {
        defaultConfigs[key] = value;
    } else {
        console.warn(`Config key "${key}" is not recognized.`);
    }
}

/**
 * Retrieves the value of a specified configuration.
 * @param {string} key - The name of the configuration to retrieve.
 * @returns {*} - The current value of the configuration, or undefined if it does not exist.
 */
function getDefaultConfig(key) {
    return defaultConfigs[key];
}

/**
 * Resets all configurations to their initial default values.
 */
function resetDefaultConfigs() {
    for (const key in defaultConfigs) {
        defaultConfigs[key] = {
            'theme': 'light',
            'timeout': 5000,
            'language': 'en',
            'debugMode': false
        }[key];
    }
}

module.exports = {
    setDefaultConfig,
    getDefaultConfig,
    resetDefaultConfigs
};

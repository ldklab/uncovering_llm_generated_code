// @smithy/util-defaults-mode-browser/index.js

// Default configurations for the browser environment
const defaultConfigs = {
    theme: 'light',
    timeout: 5000,
    language: 'en',
    debugMode: false
};

/**
 * Sets a default configuration.
 * @param {string} key - The key of the configuration to set.
 * @param {*} value - The value to set for the configuration.
 */
function setDefaultConfig(key, value) {
    if (defaultConfigs.hasOwnProperty(key)) {
        defaultConfigs[key] = value;
    } else {
        console.warn(`Config key "${key}" is not recognized.`);
    }
}

/**
 * Gets a default configuration.
 * @param {string} key - The key of the configuration to retrieve.
 * @returns {*} The value of the configuration or undefined if not set.
 */
function getDefaultConfig(key) {
    return defaultConfigs[key];
}

/**
 * Resets all configurations to their default values.
 */
function resetDefaultConfigs() {
    const initialConfigs = {
        theme: 'light',
        timeout: 5000,
        language: 'en',
        debugMode: false
    };

    Object.assign(defaultConfigs, initialConfigs);
}

module.exports = {
    setDefaultConfig,
    getDefaultConfig,
    resetDefaultConfigs
};

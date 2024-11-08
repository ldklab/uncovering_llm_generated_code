// @smithy/util-defaults-mode-browser/index.js

// Default configurations for the browser environment
const defaultConfigs = {
    theme: 'light',
    timeout: 5000,
    language: 'en',
    debugMode: false
};

/**
 * Updates a configuration in the defaultConfigs object.
 * @param {string} key - The configuration key to update.
 * @param {*} value - The new value for the configuration key.
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
 * @param {string} key - The configuration key to retrieve.
 * @returns {*} The value of the configuration or undefined if not valid.
 */
function getDefaultConfig(key) {
    return defaultConfigs[key];
}

/**
 * Reverts all configurations to their initial default values.
 */
function resetDefaultConfigs() {
    for (let key in defaultConfigs) {
        switch (key) {
            case 'theme':
                defaultConfigs[key] = 'light';
                break;
            case 'timeout':
                defaultConfigs[key] = 5000;
                break;
            case 'language':
                defaultConfigs[key] = 'en';
                break;
            case 'debugMode':
                defaultConfigs[key] = false;
                break;
            default:
                break;
        }
    }
}

module.exports = {
    setDefaultConfig,
    getDefaultConfig,
    resetDefaultConfigs
};

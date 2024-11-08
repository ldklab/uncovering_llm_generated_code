// Detect execution environment: Electron renderer/NW.js process or Node.js.

const isBrowserEnvironment = () => {
    return (
        typeof process === 'undefined' ||         // `process` is undefined (typical in browsers)
        process.type === 'renderer' ||            // Electron renderer process
        process.browser === true ||               // Explicitly set as a browser
        process.__nwjs                            // NW.js process
    );
};

if (isBrowserEnvironment()) {
    module.exports = require('./browser.js');    // Use browser-specific module
} else {
    module.exports = require('./node.js');       // Use Node.js-specific module
}

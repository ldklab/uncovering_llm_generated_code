/**
 * Detects if the environment is an Electron renderer process, a NW.js process, or a typical Node.js process,
 * exporting browser-specific or node-specific modules accordingly.
 */

const isBrowserLikeEnvironment = (typeof process === 'undefined') ||
                                 (process.type === 'renderer') ||
                                 (process.browser === true) ||
                                 (process.__nwjs);

module.exports = isBrowserLikeEnvironment ? require('./browser.js') : require('./node.js');

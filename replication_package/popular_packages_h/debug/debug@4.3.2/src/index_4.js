/**
 * Determine the runtime environment to load the appropriate module.
 * The code checks for conditions that suggest a browser-like environment,
 * such as Electron's renderer process or NW.js, and loads the browser-specific module.
 * Otherwise, it assumes a standard Node.js environment and loads its module.
 */

const isBrowserLikeEnvironment = (
  typeof process === 'undefined' || // Not a Node.js process
  process.type === 'renderer' ||    // Electron renderer
  process.browser === true ||       // Bundler/Environment's browser flag
  process.__nwjs                   // NW.js environment
);

module.exports = isBrowserLikeEnvironment ? require('./browser.js') : require('./node.js');

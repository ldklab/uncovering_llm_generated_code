// Determine the environment and export the appropriate module
let isBrowserLikeEnvironment = false;

// Check if running in a browser-like environment
if (typeof process === 'undefined') {
  isBrowserLikeEnvironment = true;
} else {
  const isElectronRenderer = process.type === 'renderer';
  const isNWjs = process.__nwjs;
  const isBrowserFlag = process.browser === true;

  if (isElectronRenderer || isNWjs || isBrowserFlag) {
    isBrowserLikeEnvironment = true;
  }
}

// Export the suitable module based on detected environment
if (isBrowserLikeEnvironment) {
  module.exports = require('./browser.js');
} else {
  module.exports = require('./node.js');
}

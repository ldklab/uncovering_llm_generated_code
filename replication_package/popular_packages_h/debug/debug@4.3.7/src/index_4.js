const isElectronRenderer = () => typeof process !== 'undefined' && process.type === 'renderer';
const isInBrowserEnvironment = () => typeof process === 'undefined' || process.browser === true;
const isNWJS = () => typeof process !== 'undefined' && process.__nwjs;

if (isInBrowserEnvironment() || isElectronRenderer() || isNWJS()) {
  module.exports = require('./browser.js');
} else {
  module.exports = require('./node.js');
}

const isElectronRenderer = typeof process !== 'undefined' && process.type === 'renderer';
const isBrowserProcess = typeof process !== 'undefined' && process.browser === true;
const isNWJSProcess = typeof process !== 'undefined' && process.__nwjs;

if (typeof process === 'undefined' || isElectronRenderer || isBrowserProcess || isNWJSProcess) {
  module.exports = require('./browser.js');
} else {
  module.exports = require('./node.js');
}

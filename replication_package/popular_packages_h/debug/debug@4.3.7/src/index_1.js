const isBrowserEnvironment = () => (
  typeof process === 'undefined' ||
  process.type === 'renderer' ||
  process.browser === true ||
  process.__nwjs
);

module.exports = isBrowserEnvironment() ? require('./browser.js') : require('./node.js');

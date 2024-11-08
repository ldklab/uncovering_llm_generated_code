/**
 * Determine execution environment and require appropriate module.
 * Environment considered as 'browser' if:
 * - process is undefined
 * - process.type is 'renderer' (indicating Electron renderer)
 * - process.browser is true
 * - process.__nwjs is truthy (indicating NW.js)
 */

const isBrowserLikeEnvironment = (typeof process === 'undefined' ||
                                  process.type === 'renderer' ||
                                  process.browser === true ||
                                  process.__nwjs);

module.exports = isBrowserLikeEnvironment ? 
                 require('./browser.js') : 
                 require('./node.js');

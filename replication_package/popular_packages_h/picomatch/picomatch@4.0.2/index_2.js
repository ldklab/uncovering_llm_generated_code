'use strict';

const pico = require('./lib/picomatch');
const utils = require('./lib/utils');

/**
 * The `picomatch` function acts as a wrapper around the `pico` function from './lib/picomatch'.
 * It allows pattern matching of file paths based on the provided glob pattern.
 * The function takes three parameters:
 * 
 * @param {string} glob - The glob pattern to be used for matching.
 * @param {Object} options - Configuration options for pattern matching.
 * @param {boolean} returnState - If true, returns the internal state of the matcher.
 * 
 * By default, if `options.windows` is not set, it will be initialized based on the platform
 * using the `utils.isWindows()` method.
 */
function picomatch(glob, options, returnState = false) {
  if (options && (options.windows === null || options.windows === undefined)) {
    options = { ...options, windows: utils.isWindows() };
  }

  return pico(glob, options, returnState);
}

// Copy over all properties and methods from the `pico` object to the `picomatch` function.
Object.assign(picomatch, pico);

module.exports = picomatch;

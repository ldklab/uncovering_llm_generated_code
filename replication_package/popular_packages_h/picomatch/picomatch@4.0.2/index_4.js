'use strict';

// Importing necessary modules
const pico = require('./lib/picomatch');
const utils = require('./lib/utils');

/**
 * Function to create a matcher function based on a glob pattern
 * 
 * @param {string} glob - The glob pattern to match against.
 * @param {object} options - Configuration options for matching.
 * @param {boolean} returnState - Flag to determine if state should be returned.
 * 
 * @returns {function} - A function that can be used to test if a string matches the glob pattern.
 */
function picomatch(glob, options, returnState = false) {
  // Set default platform option to the current OS if not provided
  if (options && (options.windows === null || options.windows === undefined)) {
    options = { ...options, windows: utils.isWindows() };
  }

  // Return a matcher function created by the pico library
  return pico(glob, options, returnState);
}

// Merge the properties of pico into picomatch
Object.assign(picomatch, pico);

// Export the picomatch function
module.exports = picomatch;

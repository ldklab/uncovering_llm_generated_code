'use strict';

const pico = require('./lib/picomatch');
const utils = require('./lib/utils');

function picomatch(glob, options = {}, returnState = false) {
  // Determine the operating system and set the default if not specified
  if (options.windows === undefined || options.windows === null) {
    // Clone the options avoiding mutation of the original object
    options = { ...options, windows: utils.isWindows() };
  }

  return pico(glob, options, returnState);
}

// Merge properties from the pico module into picomatch
Object.assign(picomatch, pico);

// Export the picomatch function
module.exports = picomatch;

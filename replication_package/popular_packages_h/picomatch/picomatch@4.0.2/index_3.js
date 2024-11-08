'use strict';

const pico = require('./lib/picomatch');
const utils = require('./lib/utils');

function picomatch(glob, options = {}, returnState = false) {
  if (options.windows === null || options.windows === undefined) {
    options = { ...options, windows: utils.isWindows() };
  }

  return pico(glob, options, returnState);
}

Object.assign(picomatch, pico);
module.exports = picomatch;

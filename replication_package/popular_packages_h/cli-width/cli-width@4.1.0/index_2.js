'use strict';

module.exports = cliWidth;

function normalizeOpts(options) {
  const defaultOpts = {
    defaultWidth: 0,
    output: process.stdout,
    tty: require('tty'),
  };

  // Assign default options if options are not provided
  options = options || {};

  // Set each key in options to default if not present
  for (const key in defaultOpts) {
    if (!options[key]) {
      options[key] = defaultOpts[key];
    }
  }

  return options;
}

function cliWidth(options) {
  const opts = normalizeOpts(options);

  // Check if output stream has getWindowSize method
  if (opts.output.getWindowSize) {
    return opts.output.getWindowSize()[0] || opts.defaultWidth;
  }

  // Check if tty has getWindowSize method
  if (opts.tty.getWindowSize) {
    return opts.tty.getWindowSize()[1] || opts.defaultWidth;
  }

  // Check if output stream has columns property
  if (opts.output.columns) {
    return opts.output.columns;
  }

  // Check if CLI_WIDTH is set in environment variables
  const cliWidthEnv = process.env.CLI_WIDTH;
  if (cliWidthEnv) {
    const parsedWidth = parseInt(cliWidthEnv, 10);
    if (!isNaN(parsedWidth) && parsedWidth !== 0) {
      return parsedWidth;
    }
  }

  // Return default width if all else fails
  return opts.defaultWidth;
}

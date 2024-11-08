'use strict';

module.exports = cliWidth;

function normalizeOptions(options) {
  const defaultOptions = {
    defaultWidth: 0,
    output: process.stdout,
    tty: require('tty'),
  };

  if (!options) {
    return defaultOptions;
  }

  Object.keys(defaultOptions).forEach(key => {
    if (!options[key]) {
      options[key] = defaultOptions[key];
    }
  });

  return options;
}

function cliWidth(options) {
  const opts = normalizeOptions(options);

  if (opts.output.getWindowSize) {
    return opts.output.getWindowSize()[0] || opts.defaultWidth;
  }

  if (opts.tty.getWindowSize) {
    return opts.tty.getWindowSize()[1] || opts.defaultWidth;
  }

  if (opts.output.columns) {
    return opts.output.columns;
  }

  if (process.env.CLI_WIDTH) {
    const width = parseInt(process.env.CLI_WIDTH, 10);
    if (!isNaN(width) && width !== 0) {
      return width;
    }
  }

  return opts.defaultWidth;
}

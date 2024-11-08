'use strict';

module.exports = determineCliWidth;

function getNormalizedOptions(options) {
  const standardOptions = {
    defaultWidth: 0,
    output: process.stdout,
    tty: require('tty'),
  };

  if (!options) return standardOptions;

  for (const key in standardOptions) {
    if (!options.hasOwnProperty(key)) {
      options[key] = standardOptions[key];
    }
  }

  return options;
}

function determineCliWidth(options) {
  const opts = getNormalizedOptions(options);

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
    const parsedWidth = parseInt(process.env.CLI_WIDTH, 10);
    if (!isNaN(parsedWidth) && parsedWidth !== 0) {
      return parsedWidth;
    }
  }

  return opts.defaultWidth;
}

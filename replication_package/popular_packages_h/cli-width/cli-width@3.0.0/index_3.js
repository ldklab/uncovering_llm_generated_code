"use strict";

// Export the main function
exports = module.exports = cliWidth;

// Helper function to normalize and fill in default options
function normalizeOpts(options) {
  // Preset default options
  const defaultOpts = {
    defaultWidth: 0,           // Default width if others are not available
    output: process.stdout,    // Default output stream (stdout)
    tty: require("tty"),       // TTY module to access terminal functionality
  };

  // If options are not provided, use default options
  if (!options) {
    return defaultOpts;
  }

  // Ensure all default options are included in the options object
  Object.keys(defaultOpts).forEach(key => {
    if (!(key in options)) {
      options[key] = defaultOpts[key];
    }
  });

  return options;
}

// Main function to determine the CLI width
function cliWidth(options) {
  // Get normalized options
  const opts = normalizeOpts(options);

  // Check methods to retrieve CLI window size in order of preference

  // If output supports getWindowSize method, use it
  if (opts.output.getWindowSize) {
    return opts.output.getWindowSize()[0] || opts.defaultWidth;
  }

  // If tty supports getWindowSize method, use it
  if (opts.tty.getWindowSize) {
    return opts.tty.getWindowSize()[1] || opts.defaultWidth;
  }

  // If output has columns property, return it
  if (opts.output.columns) {
    return opts.output.columns;
  }

  // If an environmental variable CLI_WIDTH is set, use it
  if (process.env.CLI_WIDTH) {
    const width = parseInt(process.env.CLI_WIDTH, 10);

    // Return if width is a valid number and not zero
    if (!isNaN(width) && width !== 0) {
      return width;
    }
  }

  // Fallback to default width
  return opts.defaultWidth;
}

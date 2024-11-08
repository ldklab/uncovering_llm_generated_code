"use strict";

// Exporting the cliWidth function as the module's export
module.exports = cliWidth;

// Helper function to set default options if no options are provided
function normalizeOpts(options) {
  const defaultOpts = {
    defaultWidth: 0,           // Default width if no value can be determined
    output: process.stdout,    // Default output stream
    tty: require("tty")        // Required to handle TTY (teletypewriter) interactions
  };

  if (!options) {
    return defaultOpts;
  }

  // Fill in any missing options with the defaults
  Object.keys(defaultOpts).forEach((key) => {
    if (!options[key]) {
      options[key] = defaultOpts[key];
    }
  });

  return options;
}

// Main function to calculate and return the terminal width
function cliWidth(options) {
  const opts = normalizeOpts(options);

  // Try to get the width using the getWindowSize method if it is available
  if (opts.output.getWindowSize) {
    return opts.output.getWindowSize()[0] || opts.defaultWidth;
  }

  // Use the tty module as a fallback to get window size
  if (opts.tty.getWindowSize) {
    return opts.tty.getWindowSize()[1] || opts.defaultWidth;
  }

  // Check if the output object has a `columns` property that defines the width
  if (opts.output.columns) {
    return opts.output.columns;
  }

  // Check for a CLI_WIDTH environment variable and use it if valid
  if (process.env.CLI_WIDTH) {
    const width = parseInt(process.env.CLI_WIDTH, 10);
    if (!isNaN(width) && width !== 0) {
      return width;
    }
  }

  // Fallback to the default width if no other measurement was found
  return opts.defaultWidth;
}

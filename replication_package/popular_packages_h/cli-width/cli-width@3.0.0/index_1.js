"use strict";

module.exports = cliWidth;

// Function to normalize options by filling in default values if not provided
function normalizeOpts(options) {
  const defaultOpts = {
    defaultWidth: 0,                  // Default terminal width
    output: process.stdout,           // Default output stream
    tty: require("tty"),              // tty module to access terminal capabilities
  };

  if (!options) {
    return defaultOpts;  // If no options are provided, return default options
  }

  // Ensure all missing options fields are defaulting
  for (const key in defaultOpts) {
    if (!options[key]) {
      options[key] = defaultOpts[key];
    }
  }

  return options;
}

// Calculate and return the width of the terminal
function cliWidth(options) {
  const opts = normalizeOpts(options);

  // Priority 1: Use output stream's getWindowSize method if available
  if (opts.output.getWindowSize) {
    return opts.output.getWindowSize()[0] || opts.defaultWidth;
  }

  // Priority 2: Use tty module's getWindowSize method if available
  if (opts.tty.getWindowSize) {
    return opts.tty.getWindowSize()[1] || opts.defaultWidth;
  }

  // Priority 3: Use the output stream's columns property
  if (opts.output.columns) {
    return opts.output.columns;
  }

  // Priority 4: Use the CLI_WIDTH environment variable
  if (process.env.CLI_WIDTH) {
    const width = parseInt(process.env.CLI_WIDTH, 10);

    if (!isNaN(width) && width !== 0) {
      return width;
    }
  }

  // Fallback: Return the default width if all else fails
  return opts.defaultWidth;
}

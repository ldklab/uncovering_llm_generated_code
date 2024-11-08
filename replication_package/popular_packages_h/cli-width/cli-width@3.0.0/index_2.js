"use strict";

exports = module.exports = cliWidth;

function normalizeOptions(options = {}) {
  const defaultOptions = {
    defaultWidth: 0,
    output: process.stdout,
    tty: require("tty"),
  };

  return { ...defaultOptions, ...options };
}

function cliWidth(options) {
  const opts = normalizeOptions(options);

  if (typeof opts.output.getWindowSize === "function") {
    return opts.output.getWindowSize()[0] || opts.defaultWidth;
  }

  if (typeof opts.tty.getWindowSize === "function") {
    return opts.tty.getWindowSize()[1] || opts.defaultWidth;
  }

  if (opts.output.columns) {
    return opts.output.columns;
  }

  const envWidth = parseInt(process.env.CLI_WIDTH, 10);
  if (!isNaN(envWidth) && envWidth !== 0) {
    return envWidth;
  }

  return opts.defaultWidth;
}

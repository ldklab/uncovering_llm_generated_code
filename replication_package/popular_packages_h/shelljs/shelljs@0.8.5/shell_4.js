// ShellJS - Shell commands within Node.js
// License: (c) 2012 Artur Adib - http://github.com/shelljs/shelljs

const common = require('./src/common');
const commands = require('./commands'); // Array of command names

// Load all default commands
commands.forEach(command => require(`./src/${command}`));

// Export the exit function, allowing process termination
exports.exit = process.exit;

// Export error handling utilities
exports.error = require('./src/error');

// Export ShellString utility for shell-compatible strings
exports.ShellString = common.ShellString;

// Export environment variable access
exports.env = process.env;

// Export the configuration object
exports.config = common.config;

// Configuration documentation and examples
//
// - silent: Suppress output if true (default false).
// - fatal: Throw errors on command failures if true (default false).
// - verbose: Log each command if true (default false).
// - globOptions: Options for glob.sync(), {nodir: false} by default.
// - reset(): Reset configuration to default values.

/**
 * ShellJS Configuration Reset
 * Resets all config options to default values.
 */
exports.config.reset = function() {
  exports.config.fatal = false;
  exports.config.silent = false;
  exports.config.verbose = false;
  exports.config.globOptions = {};
};

// Example pipe usage:
// grep('foo', 'file1.txt').sed(/o/g, 'a').to('output.txt');
// echo('files:', ls().grep('o'));
// cat('test.js').exec('node'); // Pipe to exec() call

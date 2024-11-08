'use strict';

// Import dependencies required for yargs functionality
const { Yargs, processArgv } = require('./build/index.cjs');

// Initialize Argv function with parsed command line arguments
Argv(processArgv.hideBin(process.argv));

// Export the Argv function for use in other parts of the application
module.exports = Argv;

/**
 * Initializes yargs with process arguments and sets up singleton functionality.
 * 
 * @param {string[]} processArgs - Array of command line arguments.
 * @param {string} [cwd] - Current working directory.
 * @returns {object} - Instance of yargs configured with input arguments.
 */
function Argv(processArgs, cwd) {
  const argv = Yargs(processArgs, cwd, require);
  setupSingleton(argv);
  return argv;
}

/**
 * Configures Argv to behave as a singleton, allowing commands like:
 * require('yargs')(['--option=1']).argv 
 * to parse custom arguments and 
 * require('yargs').argv 
 * to parse process.argv.
 * 
 * @param {object} instance - The yargs instance to be configured as a singleton.
 */
function setupSingleton(instance) {
  Object.keys(instance).forEach(key => {
    if (key === 'argv') {
      Argv.__defineGetter__(key, instance.__lookupGetter__(key));
    } else if (typeof instance[key] === 'function') {
      Argv[key] = instance[key].bind(instance);
    } else {
      Argv.__defineGetter__('$0', () => instance.$0);
      Argv.__defineGetter__('parsed', () => instance.parsed);
    }
  });
}

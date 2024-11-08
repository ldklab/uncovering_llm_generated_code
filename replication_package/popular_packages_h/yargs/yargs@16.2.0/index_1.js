'use strict';

// Import the necessary modules
const { Yargs, processArgv } = require('./build/index.cjs');

// Call Argv function with processed command line arguments
Argv(processArgv.hideBin(process.argv));

// Export the Argv function as a module
module.exports = Argv;

/**
 * Argv function: initialize a Yargs instance and make it singleton
 * @param {Array} processArgs - Command line arguments
 * @param {string} cwd - Current working directory
 * @returns {Object} - Yargs instance
 */
function Argv(processArgs, cwd) {
  // Initialize Yargs with the provided arguments
  const argv = Yargs(processArgs, cwd, require);
  
  // Convert the Yargs instance into a singleton
  singletonify(argv);
  
  // Return the singleton instance
  return argv;
}

/**
 * Singletonify function: converts a Yargs instance into a singleton
 * This allows access to the instance using require('yargs') in different contexts
 * @param {Object} inst - Yargs instance
 */
function singletonify(inst) {
  // Iterate over all keys in the instance
  Object.keys(inst).forEach(key => {
    if (key === 'argv') {
      // Define a getter for the 'argv' key
      Argv.__defineGetter__(key, inst.__lookupGetter__(key));
    } else if (typeof inst[key] === 'function') {
      // Bind functions of the instance to Argv
      Argv[key] = inst[key].bind(inst);
    } else {
      // Define getters for '$0' and 'parsed'
      Argv.__defineGetter__('$0', () => inst.$0);
      Argv.__defineGetter__('parsed', () => inst.parsed);
    }
  });
}

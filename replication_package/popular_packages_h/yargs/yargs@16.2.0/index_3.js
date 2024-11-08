'use strict';

// Require the necessary components for argument parsing
const { Yargs, processArgv } = require('./build/index.cjs');

// Initialize Argv with hidden binary arguments
Argv(processArgv.hideBin(process.argv));

// Export Argv function for external use
module.exports = Argv;

// Function to parse arguments with optional current working directory
function Argv(processArgs, cwd) {
  const argv = Yargs(processArgs, cwd, require);
  enhanceAsSingleton(argv); // Enhance as singleton instance for direct access
  return argv;
}

// Enhance instance to act like a singleton
function enhanceAsSingleton(inst) {
  Object.keys(inst).forEach(key => {
    if (key === 'argv') {
      // Define a getter for 'argv' to mimic singleton access
      Argv.__defineGetter__(key, inst.__lookupGetter__(key));
    } else if (typeof inst[key] === 'function') {
      // Bind methods directly for use
      Argv[key] = inst[key].bind(inst);
    } else {
      // Provide direct access to '$0' and 'parsed' properties via getters
      Argv.__defineGetter__('$0', () => inst.$0);
      Argv.__defineGetter__('parsed', () => inst.parsed);
    }
  });
}

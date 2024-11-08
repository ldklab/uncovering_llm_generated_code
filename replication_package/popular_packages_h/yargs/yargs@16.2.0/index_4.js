'use strict';

const { Yargs, processArgv } = require('./build/index.cjs');

// Initialize Argv with the command-line arguments
Argv(processArgv.hideBin(process.argv));

// Export the Argv function for external use
module.exports = Argv;

// Main Argv function to create and preprocess a Yargs instance
function Argv(processArgs, cwd) {
  const argv = Yargs(processArgs, cwd, require);
  makeSingleton(argv);
  return argv;
}

// Function to transform a Yargs instance into a singleton
function makeSingleton(instance) {
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

'use strict';

// Import Yargs and processArgv from a custom build.
const { Yargs, processArgv } = require('./build/index.cjs');

// Initialize Argv singleton with command line arguments.
Argv(processArgv.hideBin(process.argv));

// Export Argv function for external usage.
module.exports = Argv;

// Function to initialize and configure an Argv instance.
function Argv(processArgs, cwd) {
  // Create a new Yargs instance with the provided arguments and working directory.
  const argv = Yargs(processArgs, cwd, require);
  
  // Convert the Yargs instance into a singleton for global usage.
  singletonify(argv);
  
  // Future enhancement: Suggest users to avoid using argv.parse() or argv.argv directly.
  
  // Return the configured argv object.
  return argv;
}

// Define a property on an object with a custom getter function.
function defineGetter(obj, key, getter) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: getter,
  });
}

// Retrieve the getter function for a property on an object, if it exists.
function lookupGetter(obj, key) {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  if (typeof desc !== 'undefined') {
    return desc.get;
  }
}

// Transform an instance of Argv to act as a singleton and attach methods and properties.
function singletonify(inst) {
  // Iterate over keys and prototype properties of the Yargs instance.
  [
    ...Object.keys(inst),
    ...Object.getOwnPropertyNames(inst.constructor.prototype),
  ].forEach(key => {
    if (key === 'argv') {
      // Create a getter for 'argv' if it exists.
      defineGetter(Argv, key, lookupGetter(inst, key));
    } else if (typeof inst[key] === 'function') {
      // Bind methods to the Argv instance.
      Argv[key] = inst[key].bind(inst);
    } else {
      // Define getters for specific properties.
      defineGetter(Argv, '$0', () => inst.$0);
      defineGetter(Argv, 'parsed', () => inst.parsed);
    }
  });
}

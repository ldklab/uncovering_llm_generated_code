'use strict';

// Import the necessary components from a built module.
const { Yargs, processArgv } = require('./build/index.cjs');

// Initialize the Argv function with command-line arguments, configured as a singleton.
Argv(processArgv.hideBin(process.argv));

// Export the Argv function for external use.
module.exports = Argv;

// Main function constructor for creating a Yargs instance.
function Argv(processArgs, cwd) {
  // Create a Yargs instance, providing the constructor with the current arguments and working directory.
  const argv = Yargs(processArgs, cwd, require);

  // Convert the Yargs instance into a singleton.
  singletonify(argv);

  // Return the augmented Yargs instance.
  return argv;
}

// Helper function to define a getter property on an object.
function defineGetter(obj, key, getter) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: getter,
  });
}

// Helper function to retrieve a getter for a specific property of an object.
function lookupGetter(obj, key) {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  return desc && desc.get;
}

// Transforms an Argv instance into a singleton, allowing to reuse it across multiple calls.
function singletonify(inst) {
  [
    ...Object.keys(inst),
    ...Object.getOwnPropertyNames(inst.constructor.prototype),
  ].forEach(key => {
    if (key === 'argv') {
      // Set up 'argv' property on Argv using its getter from the instance.
      defineGetter(Argv, key, lookupGetter(inst, key));
    } else if (typeof inst[key] === 'function') {
      // Bind any function methods of the instance to Argv.
      Argv[key] = inst[key].bind(inst);
    } else {
      // Define getters for these specific additional properties.
      defineGetter(Argv, '$0', () => inst.$0);
      defineGetter(Argv, 'parsed', () => inst.parsed);
    }
  });
}

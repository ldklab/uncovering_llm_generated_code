'use strict';

const { Yargs, processArgv } = require('./build/index.cjs');

// Initialize Argv with processed command-line arguments
Argv(processArgv.hideBin(process.argv));

module.exports = Argv;

// Main function to create a 'yargs' instance and apply singleton pattern
function Argv(processArgs, cwd) {
  const argvInstance = Yargs(processArgs, cwd, require);
  makeSingleton(argvInstance);
  return argvInstance;
}

// Helper to define getter properties on an object
function defineGetter(obj, key, getter) {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: true,
    get: getter,
  });
}

// Retrieves getter from an object's property descriptor
function getGetter(obj, key) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  return descriptor ? descriptor.get : undefined;
}

// Converting a 'yargs' instance to a singleton pattern for consistent use
function makeSingleton(instance) {
  [
    ...Object.keys(instance),
    ...Object.getOwnPropertyNames(instance.constructor.prototype),
  ].forEach(key => {
    if (key === 'argv') {
      defineGetter(Argv, key, getGetter(instance, key));
    } else if (typeof instance[key] === 'function') {
      Argv[key] = instance[key].bind(instance);
    } else {
      defineGetter(Argv, '$0', () => instance.$0);
      defineGetter(Argv, 'parsed', () => instance.parsed);
    }
  });
}

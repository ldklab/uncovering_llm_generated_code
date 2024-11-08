'use strict';

const { Yargs, processArgv } = require('./build/index.cjs');

const argvSingleton = Argv(processArgv.hideBin(process.argv));

function Argv(processArgs, cwd) {
  const instance = Yargs(processArgs, cwd, require);
  setupSingleton(instance);
  return instance;
}

function setupSingleton(instance) {
  const properties = [
    ...Object.keys(instance),
    ...Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
  ];

  properties.forEach(key => {
    if (key === 'argv') {
      attachGetter(Argv, key, getPropertyGetter(instance, key));
    } else if (typeof instance[key] === 'function') {
      Argv[key] = instance[key].bind(instance);
    } else {
      attachGetter(Argv, '$0', () => instance.$0);
      attachGetter(Argv, 'parsed', () => instance.parsed);
    }
  });
}

function attachGetter(object, key, getter) {
  Object.defineProperty(object, key, {
    configurable: true,
    enumerable: true,
    get: getter,
  });
}

function getPropertyGetter(object, key) {
  const descriptor = Object.getOwnPropertyDescriptor(object, key);
  return descriptor ? descriptor.get : undefined;
}

module.exports = argvSingleton;

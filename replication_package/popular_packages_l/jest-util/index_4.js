// utils.js
const fs = require('fs');
const path = require('path');
const os = require('os');
const { promisify } = require('util');

class ErrorWithStack extends Error {
  constructor(message, { stackTraceLimit = 10 } = {}) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    if (stackTraceLimit) {
      Error.stackTraceLimit = stackTraceLimit;
    }
  }
}

function clearLine() {
  if (process.stdout.isTTY) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
}

function convertDescriptorToString(descriptor) {
  switch (typeof descriptor) {
    case 'function':
      return `[Function ${(descriptor.name || 'anonymous')}]`;
    case 'number':
    case 'string':
    case 'undefined':
      return JSON.stringify(descriptor);
    default:
      throw new Error(`Unsupported descriptor type: ${typeof descriptor}`);
  }
}

async function createDirectory(directoryPath) {
  await fs.promises.mkdir(directoryPath, { recursive: true });
}

function deepCyclicCopy(obj, opts = { blacklist: [], preservePrototypes: true }) {
  const seen = new WeakMap();
  const copy = (value) => {
    if (value !== Object(value) || typeof value === 'function') return value;
    if (seen.has(value)) return seen.get(value);
    let clone;
    if (Array.isArray(value)) {
      clone = [];
      seen.set(value, clone);
      value.forEach((item, index) => (clone[index] = copy(item)));
    } else {
      clone = Object.create(opts.preservePrototypes ? Object.getPrototypeOf(value) : {});
      seen.set(value, clone);
      for (const key in value) {
        if (!opts.blacklist.includes(key)) clone[key] = copy(value[key]);
      }
    }
    return clone;
  };
  return copy(obj);
}

function formatTime(time) {
  const units = ['ms', 'µs', 'ns'];
  let i = 0;
  while (i < units.length - 1 && time < 1) {
    time *= 1000;
    i++;
  }
  return `${time.toFixed(2)} ${units[i]}`;
}

function globsToMatcher(globs) {
  const patterns = globs.map(glob => new RegExp(glob.replace('*', '.*')));
  return str => patterns.some(pattern => pattern.test(str));
}

function installCommonGlobals(targetGlobal, globalsToInstall) {
  Object.entries(globalsToInstall).forEach(([key, value]) => {
    targetGlobal[key] = value;
  });
}

function interopRequireDefault(module) {
  return module.__esModule ? module.default : module;
}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(`Invariant failed: ${message}`);
  }
}

function isInteractive() {
  return process.stdout.isTTY && process.stdin.isTTY;
}

function isNonNullable(value) {
  return value != null;
}

function isPromise(value) {
  return !!value && typeof value.then === 'function';
}

function pluralize(word, count) {
  return count === 1 ? word : `${word}s`;
}

function preRunMessage(message) {
  if (isInteractive()) {
    console.log(message);
  }
}

function replacePathSepForGlob(filePath) {
  return filePath.replace(/\\/g, '/');
}

async function requireOrImportModule(modulePath) {
  try {
    return require(modulePath);
  } catch (err) {
    return import(modulePath);
  }
}

function setGlobal(global, key, value) {
  global[key] = value;
}

const specialChars = {
  isWindows: os.platform() === 'win32'
};

function testPathPatternToRegExp(pattern) {
  return new RegExp(pattern.replace('*', '.*'));
}

function tryRealpath(p) {
  return promisify(fs.realpath)(p).catch(() => p);
}

module.exports = {
  ErrorWithStack,
  clearLine,
  convertDescriptorToString,
  createDirectory,
  deepCyclicCopy,
  formatTime,
  globsToMatcher,
  installCommonGlobals,
  interopRequireDefault,
  invariant,
  isInteractive,
  isNonNullable,
  isPromise,
  pluralize,
  preRunMessage,
  replacePathSepForGlob,
  requireOrImportModule,
  setGlobal,
  specialChars,
  testPathPatternToRegExp,
  tryRealpath
};

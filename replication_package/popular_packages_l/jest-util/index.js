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
  const type = typeof descriptor;
  if (type === 'function') {
    return '[Function ' + (descriptor.name || 'anonymous') + ']';
  }
  if (['number', 'string', 'undefined'].includes(type)) {
    return JSON.stringify(descriptor);
  }
  throw new Error(`Unsupported descriptor type: ${type}`);
}

async function createDirectory(directoryPath) {
  return fs.promises.mkdir(directoryPath, { recursive: true });
}

function deepCyclicCopy(obj, options = { blacklist: [], preservePrototypes: true }) {
  const seen = new WeakMap();
  const copy = (value) => {
    if (value !== Object(value) || typeof value === 'function') return value;
    if (seen.has(value)) return seen.get(value);
    if (Array.isArray(value)) {
      const arrCopy = [];
      seen.set(value, arrCopy);
      value.forEach((item, index) => {
        arrCopy[index] = copy(item);
      });
      return arrCopy;
    } else {
      const objCopy = Object.create(
        options.preservePrototypes ? Object.getPrototypeOf(value) : {}
      );
      seen.set(value, objCopy);
      for (const key in value) {
        if (!options.blacklist.includes(key)) {
          objCopy[key] = copy(value[key]);
        }
      }
      return objCopy;
    }
  };
  return copy(obj);
}

function formatTime(time) {
  const prefixes = ['ms', 'µs', 'ns'];
  let index = 0;
  while (index < prefixes.length - 1 && time < 1.0) {
    time *= 1000;
    index++;
  }
  return `${time.toFixed(2)} ${prefixes[index]}`;
}

function globsToMatcher(globs) {
  const patterns = globs.map(glob => new RegExp(glob.split('*').join('.*')));
  return (str) => patterns.some(pattern => pattern.test(str));
}

function installCommonGlobals(global, globalsToInstall) {
  Object.keys(globalsToInstall).forEach(key => {
    global[key] = globalsToInstall[key];
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
  return value !== null && value !== undefined;
}

function isPromise(value) {
  return value && typeof value.then === 'function';
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
  return new RegExp(pattern.split('*').join('.*'));
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

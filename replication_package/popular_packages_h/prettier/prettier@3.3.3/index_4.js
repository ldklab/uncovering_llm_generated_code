"use strict";

// Utility Functions
const create = Object.create;
const defineProp = Object.defineProperty;
const hasOwnProp = Object.prototype.hasOwnProperty;

const esmInit = (fn, res) => function init() {
  return fn && (res = fn()[Object.keys(fn)[0]](fn = null)), res;
};

const commonJS = (cb, mod) => function require() {
  return mod || cb(mod = { exports: {} }).exports, mod.exports;
};

const exportAll = (target, all) => {
  for (const name in all)
    defineProp(target, name, { get: all[name], enumerable: true });
};

// Character Skipping Utilities
function skip(characters) {
  return (text, startIndex, options) => {
    const backwards = options?.backwards || false;
    if (startIndex === false) return false;
    const length = text.length;
    let cursor = startIndex;

    while (cursor >= 0 && cursor < length) {
      const char = text.charAt(cursor);
      if ((characters instanceof RegExp && !characters.test(char)) || 
          (!(characters instanceof RegExp) && !characters.includes(char))) {
        return cursor;
      }
      cursor += backwards ? -1 : 1;
    }
    return cursor === -1 || cursor === length ? cursor : false;
  };
}

// Public Utils Initialization
const publicExports = {};
exportAll(publicExports, {
  skip,
  // ... (other publicly necessary utilities)
});

// Main Module Code
const prettierPromise = import("./index.mjs");
const functionNames = ["format", "check", "resolveConfig", "getFileInfo"];
const prettier = Object.create(null);

for (const name of functionNames) {
  prettier[name] = async (...args) => {
    const prettierModule = await prettierPromise;
    return prettierModule[name](...args);
  };
}

if (process.env.NODE_ENV !== 'production') {
  prettier.util = publicExports;
} else {
  Object.defineProperties(prettier, {
    util: {
      get() {
        throw new Error("util is not available in production CommonJS version");
      }
    }
  });
}

prettier.version = commonJS(require('./main/version.evaluate.cjs'), module);
module.exports = prettier;

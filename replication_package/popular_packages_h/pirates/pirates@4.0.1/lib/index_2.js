"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addHook = addHook;

const Module = (() => {
  const lengthCheckModule = module.constructor;
  return lengthCheckModule.length > 1 ? lengthCheckModule : require("module").default;
})();

const path = require("path").default;
const nodeModulesRegexp = require("node-modules-regexp").default;

const HOOK_RETURNED_NOTHING_ERROR_MESSAGE = [
  '[Pirates] A hook returned a non-string, or nothing at all! This is a violation of intergalactic law!',
  'If you have no idea what this means or what Pirates is, let me explain: Pirates is a module that makes is easy to implement require hooks. One of',
  " the require hooks you're using uses it. One of these require hooks didn't return anything from it's handler, so we don't know what to",
  ' do. You might want to debug this.'
].join('\n');

function shouldCompile(filename, exts, matcher, ignoreNodeModules) {
  if (typeof filename !== 'string' || exts.indexOf(path.extname(filename)) === -1) {
    return false;
  }
  const resolvedFilename = path.resolve(filename);
  if (ignoreNodeModules && nodeModulesRegexp.test(resolvedFilename)) {
    return false;
  }
  return matcher ? !!matcher(resolvedFilename) : true;
}

function addHook(hook, opts = {}) {
  let reverted = false;
  const loaders = {};
  const oldLoaders = {};
  const originalJSLoader = Module._extensions['.js'];
  const matcher = opts.matcher || null;
  const ignoreNodeModules = opts.ignoreNodeModules !== false;
  const exts = Array.isArray(opts.exts) ? opts.exts : [opts.exts || '.js'];

  exts.forEach(ext => {
    if (typeof ext !== 'string') throw new TypeError(`Invalid Extension: ${ext}`);
    
    const oldLoader = Module._extensions[ext] || originalJSLoader;
    oldLoaders[ext] = oldLoader;

    loaders[ext] = Module._extensions[ext] = function newLoader(mod, filename) {
      const compile = mod._compile;
      if (!reverted && shouldCompile(filename, exts, matcher, ignoreNodeModules)) {
        mod._compile = function _compile(code, filename) {
          mod._compile = compile;
          const newCode = hook(code, filename);
          if (typeof newCode !== 'string') throw new Error(HOOK_RETURNED_NOTHING_ERROR_MESSAGE);
          return mod._compile(newCode, filename);
        };
      }
      oldLoader(mod, filename);
    };
  });

  return function revert() {
    if (reverted) return;
    reverted = true;
    exts.forEach(ext => {
      if (Module._extensions[ext] === loaders[ext]) {
        Module._extensions[ext] = oldLoaders[ext];
      }
    });
  };
}

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addHook = addHook;

const Module = (() => {
  const Constructor = module.constructor;
  return Constructor.length > 1 ? Constructor : require("module");
})();

const path = require("path");
const nodeModulesRegExp = require("node-modules-regexp");

const INVALID_HOOK_RETURN_ERROR = [
  "[Pirates] A hook returned a non-string, or nothing at all! This is a",
  "violation of intergalactic law!\n--------------------",
  "If you have no idea what this means or what Pirates is, let me explain:",
  "Pirates is a module that makes it easy to implement require hooks.",
  "One of the require hooks you're using didn't return anything from its handler.",
  "You might want to debug this."
].join(" ");

function shouldCompile(filename, exts, matcher, ignoreNodeModules) {
  if (typeof filename !== 'string') return false;
  if (!exts.includes(path.extname(filename))) return false;
  
  const resolvedFilename = path.resolve(filename);
  if (ignoreNodeModules && nodeModulesRegExp.test(resolvedFilename)) return false;
  
  return matcher ? matcher(resolvedFilename) : true;
}

function addHook(hook, options = {}) {
  let exts = options.extensions || options.exts || ['.js'];
  exts = Array.isArray(exts) ? exts : [exts];

  const matcher = options.matcher || null;
  const ignoreNodeModules = options.ignoreNodeModules !== false;
  const originalJSLoader = Module._extensions['.js'];

  const loaders = {};
  const oldLoaders = {};

  let reverted = false;

  exts.forEach(ext => {
    if (typeof ext !== 'string') {
      throw new TypeError(`Invalid Extension: ${ext}`);
    }

    const oldLoader = Module._extensions[ext] || originalJSLoader;
    oldLoaders[ext] = oldLoader;

    loaders[ext] = Module._extensions[ext] = (mod, filename) => {
      if (reverted) return oldLoader(mod, filename);

      const compile = mod._compile;
      
      if (shouldCompile(filename, exts, matcher, ignoreNodeModules)) {
        mod._compile = function (code) {
          mod._compile = compile;
          const newCode = hook(code, filename);
          if (typeof newCode !== 'string') {
            throw new Error(INVALID_HOOK_RETURN_ERROR);
          }
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

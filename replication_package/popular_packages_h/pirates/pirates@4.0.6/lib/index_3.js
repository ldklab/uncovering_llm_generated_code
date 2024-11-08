"use strict";

import module from 'module';
import path from 'path';

export function addHook(hook, opts = {}) {
  const nodeModulesRegex = /^(?:.*[\\/])?node_modules(?:[\\/].*)?$/;
  const HOOK_RETURNED_NOTHING_ERROR_MESSAGE = '[Pirates] A hook returned a non-string, or nothing at all! This is a violation of intergalactic law!\n--------------------\nIf you have no idea what this means or what Pirates is, let me explain: Pirates is a module that makes it easy to implement require hooks. One of the require hooks you\'re using uses it. One of these require hooks didn\'t return anything from its handler, so we don\'t know what to do. You might want to debug this.';
  const Module = module.constructor.length > 1 ? module.constructor : module;

  function shouldCompile(filename, exts, matcher, ignoreNodeModules) {
    if (typeof filename !== 'string') return false;
    if (!exts.includes(path.extname(filename))) return false;
    const resolvedFilename = path.resolve(filename);
    if (ignoreNodeModules && nodeModulesRegex.test(resolvedFilename)) return false;
    if (matcher && typeof matcher === 'function') return !!matcher(resolvedFilename);
    return true;
  }

  let reverted = false;
  const loaders = {};
  const oldLoaders = {};
  let exts;
  
  const originalJSLoader = Module._extensions['.js'];
  const matcher = opts.matcher || null;
  const ignoreNodeModules = opts.ignoreNodeModules !== false;
  
  exts = opts.extensions || opts.exts || opts.extension || opts.ext || ['.js'];
  if (!Array.isArray(exts)) {
    exts = [exts];
  }
  
  exts.forEach(ext => {
    if (typeof ext !== 'string') {
      throw new TypeError(`Invalid Extension: ${ext}`);
    }
    
    const oldLoader = Module._extensions[ext] || originalJSLoader;
    oldLoaders[ext] = oldLoader;
    
    loaders[ext] = Module._extensions[ext] = function newLoader(mod, filename) {
      let compile;
      if (!reverted) {
        if (shouldCompile(filename, exts, matcher, ignoreNodeModules)) {
          compile = mod._compile;
          mod._compile = function _compile(code) {
            mod._compile = compile;  // Reset immediately
            const newCode = hook(code, filename);
            if (typeof newCode !== 'string') {
              throw new Error(HOOK_RETURNED_NOTHING_ERROR_MESSAGE);
            }
            return mod._compile(newCode, filename);
          };
        }
      }
      oldLoader(mod, filename);
    };
  });
  
  return function revert() {
    if (reverted) return;
    reverted = true;
    exts.forEach(ext => {
      if (Module._extensions[ext] === loaders[ext]) {
        if (!oldLoaders[ext]) {
          delete Module._extensions[ext];
        } else {
          Module._extensions[ext] = oldLoaders[ext];
        }
      }
    });
  };
}

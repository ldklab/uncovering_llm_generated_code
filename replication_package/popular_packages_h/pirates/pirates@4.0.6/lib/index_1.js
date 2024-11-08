"use strict";

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import path from 'path';

const nodeModulesRegex = /^(?:.*[\\/])?node_modules(?:[\\/].*)?$/;
const Module = module.constructor.length > 1 ? module.constructor : require('module').default;
const HOOK_RETURNED_NOTHING_ERROR_MESSAGE = '[Pirates] A hook returned a non-string, or nothing at all! This is a violation of intergalactic law!\n--------------------\nIf you have no idea what this means or what Pirates is, let me explain: Pirates is a module that makes is easy to implement require hooks. One of the require hooks you\'re using uses it. One of these require hooks didn\'t return anything from it\'s handler, so we don\'t know what to do. You might want to debug this.';

function shouldCompile(filename, exts, matcher, ignoreNodeModules) {
  if (typeof filename !== 'string') return false;
  if (exts.indexOf(path.extname(filename)) === -1) return false;
  const resolvedFilename = path.resolve(filename);
  if (ignoreNodeModules && nodeModulesRegex.test(resolvedFilename)) return false;
  if (matcher && typeof matcher === 'function') {
    return !!matcher(resolvedFilename);
  }
  return true;
}

export function addHook(hook, opts = {}) {
  let reverted = false;
  const loaders = {};
  const oldLoaders = {};
  const originalJSLoader = Module._extensions['.js'];
  const matcher = opts.matcher || null;
  const ignoreNodeModules = opts.ignoreNodeModules !== false;
  const extensions = opts.extensions || opts.exts || opts.extension || opts.ext || ['.js'];
  const exts = Array.isArray(extensions) ? extensions : [extensions];

  exts.forEach(ext => {
    if (typeof ext !== 'string') {
      throw new TypeError(`Invalid Extension: ${ext}`);
    }
    const oldLoader = Module._extensions[ext] || originalJSLoader;
    oldLoaders[ext] = oldLoader;

    const newLoader = function(mod, filename) {
      const originalCompile = mod._compile;
      if (!reverted && shouldCompile(filename, exts, matcher, ignoreNodeModules)) {
        mod._compile = function(code) {
          mod._compile = originalCompile;
          const newCode = hook(code, filename);
          if (typeof newCode !== 'string') {
            throw new Error(HOOK_RETURNED_NOTHING_ERROR_MESSAGE);
          }
          mod._compile(newCode, filename);
        };
      }
      oldLoader(mod, filename);
    };

    loaders[ext] = newLoader;
    Module._extensions[ext] = newLoader;
  });

  return function revert() {
    if (reverted) return;
    reverted = true;
    exts.forEach(ext => {
      if (Module._extensions[ext] === loaders[ext]) {
        if (oldLoaders[ext]) {
          Module._extensions[ext] = oldLoaders[ext];
        } else {
          delete Module._extensions[ext];
        }
      }
    });
  };
}

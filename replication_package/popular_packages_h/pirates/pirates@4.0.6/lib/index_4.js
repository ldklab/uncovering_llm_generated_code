"use strict";

import Module from "module";
import path from "path";

const nodeModulesRegex = /^(?:.*[\\/])?node_modules(?:[\\/].*)?$/;

const ModuleConstructor = module.constructor.length > 1 ? module.constructor : Module;
const HOOK_RETURNED_NOTHING_ERROR_MESSAGE = '[Pirates] A hook returned a non-string, or nothing at all! Violation of intergalactic law!';

export function addHook(hook, { matcher = null, ignoreNodeModules = true, extensions = ['.js'] } = {}) {
  let reverted = false;
  const loaders = {};
  const oldLoaders = {};
  const originalJSLoader = ModuleConstructor._extensions['.js'];

  extensions.forEach(ext => {
    if (typeof ext !== 'string') throw new TypeError(`Invalid Extension: ${ext}`);

    const oldLoader = ModuleConstructor._extensions[ext] || originalJSLoader;
    oldLoaders[ext] = ModuleConstructor._extensions[ext];

    loaders[ext] = ModuleConstructor._extensions[ext] = function newLoader(mod, filename) {
      if (!reverted && shouldCompile(filename, extensions, matcher, ignoreNodeModules)) {
        const compile = mod._compile;
        mod._compile = function _compile(code) {
          const newCode = hook(code, filename);
          if (typeof newCode !== 'string') throw new Error(HOOK_RETURNED_NOTHING_ERROR_MESSAGE);
          mod._compile = compile;
          return mod._compile(newCode, filename);
        };
      }
      oldLoader(mod, filename);
    };
  });

  return function revert() {
    if (reverted) return;
    reverted = true;
    extensions.forEach(ext => {
      if (ModuleConstructor._extensions[ext] === loaders[ext]) {
        if (!oldLoaders[ext]) {
          delete ModuleConstructor._extensions[ext];
        } else {
          ModuleConstructor._extensions[ext] = oldLoaders[ext];
        }
      }
    });
  };
}

function shouldCompile(filename, exts, matcher, ignoreNodeModules) {
  if (typeof filename !== 'string') return false;
  if (!exts.includes(path.extname(filename))) return false;
  const resolvedFilename = path.resolve(filename);
  if (ignoreNodeModules && nodeModulesRegex.test(resolvedFilename)) return false;
  if (matcher && typeof matcher === 'function') return !!matcher(resolvedFilename);
  return true;
}

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addHook = addHook;
const Module = require("module");
const path = require("path");

const NODE_MODULES_REGEX = /^(?:.*[\\/])?node_modules(?:[\\/].*)?$/;
const OriginalModule = Module.constructor.length > 1 ? Module.constructor : Module;
const HOOK_ERROR_MESSAGE = '[Pirates] A hook returned a non-string or nothing at all, violating laws!\n' +
  'If confused, Pirates is middleware for require hooks, debug your hooks.';

/**
 * Determines if a file should be processed by a hook.
 * @param {string} filename
 * @param {string[]} extensions
 * @param {function|null} matcher
 * @param {boolean} ignoreNodeModules
 * @returns {boolean}
 */
function shouldCompile(filename, extensions, matcher, ignoreNodeModules) {
  if (typeof filename !== 'string') return false;
  if (!extensions.includes(path.extname(filename))) return false;
  const resolvedFilename = path.resolve(filename);
  if (ignoreNodeModules && NODE_MODULES_REGEX.test(resolvedFilename)) return false;
  if (matcher && typeof matcher === 'function') return !!matcher(resolvedFilename);
  return true;
}

/**
 * Adds a require hook to process files during module loading.
 * @param {function} hook - Processes module code.
 * @param {object} [options] - Configuration options.
 * @returns {function} - Reverts the added hook.
 */
function addHook(hook, options = {}) {
  let reverted = false;
  const loaders = [];
  const previousLoaders = [];
  const extensions = options.extensions || options.exts || options.extension || options.ext || ['.js'];

  const originalLoader = Module._extensions['.js'];
  const matcher = options.matcher || null;
  const ignoreNodeModules = options.ignoreNodeModules !== false;

  extensions.forEach(ext => {
    if (typeof ext !== 'string') throw new TypeError(`Invalid Extension: ${ext}`);

    const existingLoader = Module._extensions[ext] || originalLoader;
    previousLoaders[ext] = existingLoader;

    loaders[ext] = Module._extensions[ext] = function(mod, filename) {
      if (!reverted && shouldCompile(filename, extensions, matcher, ignoreNodeModules)) {
        const originalCompile = mod._compile;
        mod._compile = function(code) {
          mod._compile = originalCompile;
          const result = hook(code, filename);
          if (typeof result !== 'string') throw new Error(HOOK_ERROR_MESSAGE);
          return mod._compile(result, filename);
        };
      }
      existingLoader(mod, filename);
    };
  });

  return function revert() {
    if (reverted) return;
    reverted = true;
    extensions.forEach(ext => {
      if (Module._extensions[ext] === loaders[ext]) {
        if (!previousLoaders[ext]) {
          delete Module._extensions[ext];
        } else {
          Module._extensions[ext] = previousLoaders[ext];
        }
      }
    });
  };
}

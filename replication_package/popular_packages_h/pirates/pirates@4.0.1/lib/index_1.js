"use strict";

const Module = require("module");
const path = require("path");
const nodeModulesRegexp = require("node-modules-regexp");

const originalModuleConstructor = module.constructor.length > 1 ? module.constructor : Module;
const HOOK_ERROR_MSG = '[Pirates] A hook returned a non-string, or nothing at all! This is a violation of intergalactic law!\n--------------------\nIf you have no idea what this means or what Pirates is, let me explain: Pirates is a module that makes it easy to implement require hooks. One of the require hooks you\'re using uses it. One of these require hooks didn\'t return anything from its handler, so we don\'t know what to do. You might want to debug this.';

function shouldCompile(filename, exts, matcher, ignoreNodeModules) {
  if (typeof filename !== 'string') return false;
  if (!exts.includes(path.extname(filename))) return false;

  const resolvedFilename = path.resolve(filename);
  if (ignoreNodeModules && nodeModulesRegexp.test(resolvedFilename)) return false;

  return matcher ? !!matcher(resolvedFilename) : true;
}

function addHook(hook, opts = {}) {
  let reverted = false;
  const originalJSLoader = Module._extensions['.js'];
  const loaders = {};
  const oldLoaders = {};
  const exts = Array.isArray(opts.exts || opts.extensions || ['.js']) ? opts.exts || opts.extensions || ['.js'] : [opts.exts || opts.extensions || '.js'];

  const matcher = opts.matcher || null;
  const ignoreNodeModules = opts.ignoreNodeModules !== false;

  exts.forEach(ext => {
    if (typeof ext !== 'string') throw new TypeError(`Invalid Extension: ${ext}`);

    const oldLoader = Module._extensions[ext] || originalJSLoader;
    oldLoaders[ext] = oldLoader;

    loaders[ext] = Module._extensions[ext] = function newLoader(mod, filename) {
      if (!reverted && shouldCompile(filename, exts, matcher, ignoreNodeModules)) {
        const compile = mod._compile;
        mod._compile = function(code, filename) {
          mod._compile = compile;
          const newCode = hook(code, filename);
          if (typeof newCode !== 'string') throw new Error(HOOK_ERROR_MSG);
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

exports.addHook = addHook;

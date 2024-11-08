"use strict";

const { mkdirpManual, mkdirpManualSync } = require("./mkdirp-manual.js");
const { mkdirpNative, mkdirpNativeSync } = require("./mkdirp-native.js");
const { optsArg } = require("./opts-arg.js");
const { pathArg } = require("./path-arg.js");
const { useNative, useNativeSync } = require("./use-native.js");

// Synchronous mkdirp implementation
const mkdirpSync = (path, opts) => {
  path = pathArg(path);
  const resolvedOpts = optsArg(opts);
  return useNativeSync(resolvedOpts)
    ? mkdirpNativeSync(path, resolvedOpts)
    : mkdirpManualSync(path, resolvedOpts);
};

// Asynchronous mkdirp implementation
const mkdirp = async (path, opts) => {
  path = pathArg(path);
  const resolvedOpts = optsArg(opts);
  return useNative(resolvedOpts)
    ? mkdirpNative(path, resolvedOpts)
    : mkdirpManual(path, resolvedOpts);
};

// Main export object that encapsulates all functionality
const mkdirpExport = Object.assign(mkdirp, {
  mkdirpSync,
  mkdirpNative,
  mkdirpNativeSync,
  mkdirpManual,
  mkdirpManualSync,
  sync: mkdirpSync,
  native: mkdirpNative,
  nativeSync: mkdirpNativeSync,
  manual: mkdirpManual,
  manualSync: mkdirpManualSync,
  useNative,
  useNativeSync
});

// Export the mkdirp functionality
exports.mkdirp = mkdirpExport;
exports.mkdirpSync = mkdirpSync;
exports.sync = mkdirpSync;
exports.manual = mkdirpManual;
exports.manualSync = mkdirpManualSync;
exports.native = mkdirpNative;
exports.nativeSync = mkdirpNativeSync;
exports.mkdirpManual = mkdirpManual;
exports.mkdirpManualSync = mkdirpManualSync;
exports.mkdirpNative = mkdirpNative;
exports.mkdirpNativeSync = mkdirpNativeSync;
exports.useNative = useNative;
exports.useNativeSync = useNativeSync;

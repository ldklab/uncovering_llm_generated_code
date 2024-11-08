"use strict";
const {
  mkdirpManual,
  mkdirpManualSync
} = require("./mkdirp-manual.js");
const {
  mkdirpNative,
  mkdirpNativeSync
} = require("./mkdirp-native.js");
const {
  optsArg
} = require("./opts-arg.js");
const {
  pathArg
} = require("./path-arg.js");
const {
  useNative,
  useNativeSync
} = require("./use-native.js");

const mkdirpSync = (path, opts) => {
  path = pathArg(path);
  const resolved = optsArg(opts);
  return useNativeSync(resolved)
    ? mkdirpNativeSync(path, resolved)
    : mkdirpManualSync(path, resolved);
};

const mkdirp = async (path, opts) => {
  path = pathArg(path);
  const resolved = optsArg(opts);
  return useNative(resolved)
    ? mkdirpNative(path, resolved)
    : mkdirpManual(path, resolved);
};

const exportsObj = {
  mkdirpSync,
  mkdirp,
  sync: mkdirpSync,
  manual: mkdirpManual,
  manualSync: mkdirpManualSync,
  native: mkdirpNative,
  nativeSync: mkdirpNativeSync,
  useNative,
  useNativeSync,
  mkdirpManual,
  mkdirpManualSync,
  mkdirpNative,
  mkdirpNativeSync
};

module.exports = exportsObj;

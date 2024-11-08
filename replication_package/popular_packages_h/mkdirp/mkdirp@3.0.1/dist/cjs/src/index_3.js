"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const {
  mkdirpManual,
  mkdirpManualSync,
} = require("./mkdirp-manual.js");
const {
  mkdirpNative,
  mkdirpNativeSync,
} = require("./mkdirp-native.js");
const { optsArg } = require("./opts-arg.js");
const { pathArg } = require("./path-arg.js");
const { useNative, useNativeSync } = require("./use-native.js");

exports.mkdirpManual = mkdirpManual;
exports.mkdirpManualSync = mkdirpManualSync;
exports.mkdirpNative = mkdirpNative;
exports.mkdirpNativeSync = mkdirpNativeSync;
exports.useNative = useNative;
exports.useNativeSync = useNativeSync;

const mkdirpSync = (path, opts) => {
  path = pathArg(path);
  const resolved = optsArg(opts);
  return useNativeSync(resolved)
    ? mkdirpNativeSync(path, resolved)
    : mkdirpManualSync(path, resolved);
};

exports.mkdirpSync = mkdirpSync;
exports.sync = mkdirpSync;
exports.manual = mkdirpManual;
exports.manualSync = mkdirpManualSync;
exports.native = mkdirpNative;
exports.nativeSync = mkdirpNativeSync;

exports.mkdirp = Object.assign(
  async (path, opts) => {
    path = pathArg(path);
    const resolved = optsArg(opts);
    return useNative(resolved)
      ? mkdirpNative(path, resolved)
      : mkdirpManual(path, resolved);
  },
  {
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
    useNativeSync,
  }
);

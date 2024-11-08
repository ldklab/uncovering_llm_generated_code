"use strict";
const { glob, globSync } = require("glob");
const { optArg, optArgSync, assertRimrafOptions, isRimrafOptions } = require("./opt-arg.js");
const pathArg = require("./path-arg.js").default;
const { rimrafManual, rimrafManualSync } = require("./rimraf-manual.js");
const { rimrafMoveRemove, rimrafMoveRemoveSync } = require("./rimraf-move-remove.js");
const { rimrafNative, rimrafNativeSync } = require("./rimraf-native.js");
const { rimrafPosix, rimrafPosixSync } = require("./rimraf-posix.js");
const { rimrafWindows, rimrafWindowsSync } = require("./rimraf-windows.js");
const { useNative, useNativeSync } = require("./use-native.js");

const wrap = (fn) => async (path, opt) => {
    const options = optArg(opt);
    if (options.glob) {
        path = await glob(path, options.glob);
    }
    if (Array.isArray(path)) {
        return !!(await Promise.all(path.map(p => fn(pathArg(p, options), options)))).reduce((a, b) => a && b, true);
    } else {
        return !!(await fn(pathArg(path, options), options));
    }
};

const wrapSync = (fn) => (path, opt) => {
    const options = optArgSync(opt);
    if (options.glob) {
        path = globSync(path, options.glob);
    }
    if (Array.isArray(path)) {
        return !!path.map(p => fn(pathArg(p, options), options)).reduce((a, b) => a && b, true);
    } else {
        return !!fn(pathArg(path, options), options);
    }
};

exports.assertRimrafOptions = assertRimrafOptions;
exports.isRimrafOptions = isRimrafOptions;

exports.nativeSync = wrapSync(rimrafNativeSync);
exports.native = Object.assign(wrap(rimrafNative), { sync: exports.nativeSync });

exports.manualSync = wrapSync(rimrafManualSync);
exports.manual = Object.assign(wrap(rimrafManual), { sync: exports.manualSync });

exports.windowsSync = wrapSync(rimrafWindowsSync);
exports.windows = Object.assign(wrap(rimrafWindows), { sync: exports.windowsSync });

exports.posixSync = wrapSync(rimrafPosixSync);
exports.posix = Object.assign(wrap(rimrafPosix), { sync: exports.posixSync });

exports.moveRemoveSync = wrapSync(rimrafMoveRemoveSync);
exports.moveRemove = Object.assign(wrap(rimrafMoveRemove), { sync: exports.moveRemoveSync });

exports.rimrafSync = wrapSync((path, opt) => useNativeSync(opt) ? rimrafNativeSync(path, opt) : rimrafManualSync(path, opt));
exports.sync = exports.rimrafSync;

const rimraf_ = wrap((path, opt) => useNative(opt) ? rimrafNative(path, opt) : rimrafManual(path, opt));
exports.rimraf = Object.assign(rimraf_, {
    rimraf: rimraf_,
    sync: exports.rimrafSync,
    rimrafSync: exports.rimrafSync,
    manual: exports.manual,
    manualSync: exports.manualSync,
    native: exports.native,
    nativeSync: exports.nativeSync,
    posix: exports.posix,
    posixSync: exports.posixSync,
    windows: exports.windows,
    windowsSync: exports.windowsSync,
    moveRemove: exports.moveRemove,
    moveRemoveSync: exports.moveRemoveSync,
});
exports.rimraf.rimraf = exports.rimraf;

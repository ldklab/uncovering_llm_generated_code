"use strict";

const posix = require("./posix.js");
const win32 = require("./win32.js");
const options = require("./options.js");

Object.assign(exports, options);

const platform = process.env._ISEXE_TEST_PLATFORM_ || process.platform;
const impl = platform === 'win32' ? win32 : posix;

/**
 * Determine whether a path is executable on the current platform.
 */
exports.isexe = impl.isexe;

/**
 * Synchronously determine whether a path is executable on the
 * current platform.
 */
exports.sync = impl.sync;

exports.posix = posix;
exports.win32 = win32;

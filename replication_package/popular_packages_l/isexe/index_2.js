const fs = require('fs');
const util = require('util');
const statAsync = util.promisify(fs.stat);

function checkExecutableOnWin32(path, pathExt) {
  const ext = path.split('.').pop(); // Get the file extension
  return pathExt.includes(`.${ext}`); // Check if the extension is in the allowed pathExt
}

function checkExecutableOnPosix(stats, uid, gid) {
  const { mode } = stats; // Extract mode from stats
  const isOwner = (stats.uid === uid); // Check if the current user is the owner
  const isGroup = (stats.gid === gid); // Check if the current group is the group
  // Check executable bits for owner, group, others
  return ((isOwner && (mode & fs.constants.S_IXUSR)) ||
          (isGroup && (mode & fs.constants.S_IXGRP)) ||
          (mode & fs.constants.S_IXOTH));
}

async function isexe(path, options = {}) {
  try {
    const stats = await statAsync(path); // Get file stats
    // Check based on platform
    return process.platform === 'win32'
      ? checkExecutableOnWin32(path, options.pathExt || process.env.PATHEXT.split(';'))
      : checkExecutableOnPosix(stats, options.uid || process.getuid(), options.gid || process.getgid());
  } catch (err) {
    if (options.ignoreErrors) return false; // Optionally ignore errors
    throw err; // Throw error by default
  }
}

function sync(path, options = {}) {
  try {
    const stats = fs.statSync(path); // Get file stats synchronously
    // Check based on platform
    return process.platform === 'win32'
      ? checkExecutableOnWin32(path, options.pathExt || process.env.PATHEXT.split(';'))
      : checkExecutableOnPosix(stats, options.uid || process.getuid(), options.gid || process.getgid());
  } catch (err) {
    if (options.ignoreErrors) return false; // Optionally ignore errors
    throw err; // Throw error by default
  }
}

const win32 = {
  // Define exported functions for Windows
  isexe: async (path, options) => await isexe(path, { ...options, pathExt: options.pathExt || process.env.PATHEXT.split(';') }),
  sync: (path, options) => sync(path, { ...options, pathExt: options.pathExt || process.env.PATHEXT.split(';') })
};

const posix = {
  // Define exported functions for POSIX systems
  isexe: async (path, options) => await isexe(path, options),
  sync: (path, options) => sync(path, options)
};

// Select implementation based on platform
const selectedImplementation = process.platform === 'win32' ? win32 : posix;

module.exports = {
  ...selectedImplementation,
  win32,
  posix
};

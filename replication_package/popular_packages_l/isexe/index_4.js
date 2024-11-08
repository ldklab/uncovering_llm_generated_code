import { stat, constants } from 'fs';
import { promisify } from 'util';

const statAsync = promisify(stat);

// Function to check executable status on Windows
function checkExecutableOnWin32(path, pathExt) {
  const ext = path.split('.').pop(); // Get file extension
  return pathExt.includes(`.${ext}`); // Check if the extension is in the provided extensions
}

// Function to check executable status on POSIX systems
function checkExecutableOnPosix(stats, uid, gid) {
  const { mode } = stats;
  const isOwner = (stats.uid === uid); // Check file ownership
  const isGroup = (stats.gid === gid); // Check file group
  // Check if executable by owner, group or others
  return ((isOwner && (mode & constants.S_IXUSR)) ||
          (isGroup && (mode & constants.S_IXGRP)) ||
          (mode & constants.S_IXOTH));
}

// Main asynchronous function to check if a path is executable
async function isexe(path, options = {}) {
  try {
    const stats = await statAsync(path); // Get file stats
    return process.platform === 'win32'
      ? checkExecutableOnWin32(path, options.pathExt || process.env.PATHEXT.split(';'))
      : checkExecutableOnPosix(
          stats,
          options.uid ?? process.getuid(),
          options.gid ?? process.getgid()
        );
  } catch (err) {
    if (options.ignoreErrors) return false; // Ignore errors if specified
    throw err; // Otherwise, rethrow the error
  }
}

// Synchronous version of the execution check
function sync(path, options = {}) {
  try {
    const stats = stat(path); // Get file stats synchronously
    return process.platform === 'win32'
      ? checkExecutableOnWin32(path, options.pathExt || process.env.PATHEXT.split(';'))
      : checkExecutableOnPosix(
          stats,
          options.uid ?? process.getuid(),
          options.gid ?? process.getgid()
        );
  } catch (err) {
    if (options.ignoreErrors) return false; // Ignore errors if specified
    throw err; // Otherwise, rethrow the error
  }
}

// Define behaviors for Windows platform
const win32 = {
  isexe: async (path, options) => await isexe(path, { ...options, pathExt: options.pathExt || process.env.PATHEXT.split(';') }),
  sync: (path, options) => sync(path, { ...options, pathExt: options.pathExt || process.env.PATHEXT.split(';') })
};

// Define behaviors for POSIX platforms
const posix = {
  isexe: async (path, options) => await isexe(path, options),
  sync: (path, options) => sync(path, options)
};

// Choose implementation based on the platform
const selectedImplementation = process.platform === 'win32' ? win32 : posix;

// Export the selected implementation
export const { isexe, sync } = selectedImplementation;
export { win32, posix };

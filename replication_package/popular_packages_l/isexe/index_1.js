import { stat, constants } from 'fs';
import { promisify } from 'util';

const statAsync = promisify(stat); // Converts the callback-based 'stat' function to a promise-based one for async use

// Checks if a file is executable on Windows by comparing its extension with a list of executable extensions
function checkExecutableOnWin32(path, pathExt) {
  const ext = path.split('.').pop(); // Extracts file extension
  return pathExt.includes(`.${ext}`); // Checks if the extension is in the allowed executable extensions
}

// Checks if a file is executable on POSIX systems by checking permission bits
function checkExecutableOnPosix(stats, uid, gid) {
  const { mode } = stats; // Extracts file mode from stats
  const isOwner = (stats.uid === uid); // Checks if current user is the file owner
  const isGroup = (stats.gid === gid); // Checks if current group is the file owner group
  // Checks if the file is executable for owner, group, or others
  return ((isOwner && (mode & constants.S_IXUSR)) ||
          (isGroup && (mode & constants.S_IXGRP)) ||
          (mode & constants.S_IXOTH));
}

// Asynchronously checks if a file is executable
async function isexe(path, options = {}) {
  try {
    const stats = await statAsync(path); // Asynchronously retrieves file stats
    return process.platform === 'win32'
      ? checkExecutableOnWin32(path, options.pathExt || process.env.PATHEXT.split(';'))
      : checkExecutableOnPosix(stats, options.uid || process.getuid(), options.gid || process.getgid());
  } catch (err) {
    if (options.ignoreErrors) return false; // Returns false if errors are to be ignored
    throw err; // Re-throws error if not ignoring
  }
}

// Synchronously checks if a file is executable
function sync(path, options = {}) {
  try {
    const stats = stat(path); // Synchronously retrieves file stats
    return process.platform === 'win32'
      ? checkExecutableOnWin32(path, options.pathExt || process.env.PATHEXT.split(';'))
      : checkExecutableOnPosix(stats, options.uid || process.getuid(), options.gid || process.getgid());
  } catch (err) {
    if (options.ignoreErrors) return false; // Returns false if errors are to be ignored
    throw err; // Re-throws error if not ignoring
  }
}

const win32 = {
  // Windows-specific implementation of isexe and sync
  isexe: async (path, options) => await isexe(path, { ...options, pathExt: options.pathExt || process.env.PATHEXT.split(';') }),
  sync: (path, options) => sync(path, { ...options, pathExt: options.pathExt || process.env.PATHEXT.split(';') })
};

const posix = {
  // POSIX-specific implementation of isexe and sync
  isexe: async (path, options) => await isexe(path, options),
  sync: (path, options) => sync(path, options)
};

// Selects the appropriate implementation based on the current platform
const selectedImplementation = process.platform === 'win32' ? win32 : posix;

// Exports the functions from the selected platform implementation
export const { isexe, sync } = selectedImplementation;
export { win32, posix };

const fs = require('fs');
const path = require('path');

/**
 * Recursively change the owner and group of files and directories.
 * @param {string} dirPath - Directory path.
 * @param {number} uid - User ID for ownership.
 * @param {number} gid - Group ID for ownership.
 */
function changeOwnershipRecursively(dirPath, uid, gid) {
  fs.lstat(dirPath, (error, stats) => {
    if (error) {
      console.error(`Cannot access ${dirPath}:`, error.message);
      return;
    }

    // Change owner and group of directory itself or file
    fs.chown(dirPath, uid, gid, (chownError) => {
      if (chownError) {
        console.error(`Failed to change ownership of ${dirPath}:`, chownError.message);
      }
    });

    // If it's a directory, process its contents recursively
    if (stats.isDirectory()) {
      fs.readdir(dirPath, (readError, files) => {
        if (readError) {
          console.error(`Cannot read contents of ${dirPath}:`, readError.message);
          return;
        }

        // Recursively apply owner changes to each item in directory
        files.forEach((file) => {
          const fullPath = path.join(dirPath, file);
          changeOwnershipRecursively(fullPath, uid, gid);
        });
      });
    }
  });
}

// Export function for use in other modules
module.exports = changeOwnershipRecursively;

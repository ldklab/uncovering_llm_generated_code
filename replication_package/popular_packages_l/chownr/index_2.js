const fs = require('fs');
const path = require('path');

/**
 * Recursively change ownership of files and directories.
 * @param {string} dirPath - Path of the directory or file.
 * @param {number} uid - User ID.
 * @param {number} gid - Group ID.
 */
function changeOwnershipRecursively(dirPath, uid, gid) {
  fs.lstat(dirPath, (err, stats) => {
    if (err) {
      console.error(`Failed to retrieve stats for ${dirPath}: ${err.message}`);
      return;
    }

    if (stats.isDirectory()) {
      fs.chown(dirPath, uid, gid, (err) => {
        if (err) {
          console.error(`Failed to set ownership for directory ${dirPath}: ${err.message}`);
          return;
        }

        fs.readdir(dirPath, (err, items) => {
          if (err) {
            console.error(`Failed to read contents of ${dirPath}: ${err.message}`);
            return;
          }

          items.forEach((item) => {
            const resolvedPath = path.resolve(dirPath, item);
            changeOwnershipRecursively(resolvedPath, uid, gid);
          });
        });
      });
    } else {
      fs.chown(dirPath, uid, gid, (err) => {
        if (err) {
          console.error(`Failed to set ownership for file ${dirPath}: ${err.message}`);
        }
      });
    }
  });
}

module.exports = changeOwnershipRecursively;

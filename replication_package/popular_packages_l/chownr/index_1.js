const fs = require('fs');
const path = require('path');

/**
 * Recursively change ownership of files and directories.
 * @param {string} dirPath - Directory path.
 * @param {number} uid - User ID.
 * @param {number} gid - Group ID.
 */
function changeOwnershipRecursively(dirPath, uid, gid) {
  fs.lstat(dirPath, (error, stats) => {
    if (error) {
      console.error(`Failed to access ${dirPath}:`, error.message);
      return;
    }

    const changeOwnership = (path) => {
      fs.chown(path, uid, gid, (error) => {
        if (error) {
          console.error(`Failed to change ownership for ${path}:`, error.message);
        }
      });
    };

    if (stats.isDirectory()) {
      changeOwnership(dirPath);
      
      fs.readdir(dirPath, (error, contents) => {
        if (error) {
          console.error(`Failed to read directory ${dirPath}:`, error.message);
          return;
        }

        contents.forEach((item) => {
          const itemPath = path.join(dirPath, item);
          changeOwnershipRecursively(itemPath, uid, gid);
        });
      });
    } else {
      changeOwnership(dirPath);
    }
  });
}

module.exports = changeOwnershipRecursively;

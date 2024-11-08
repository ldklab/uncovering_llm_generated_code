const fs = require('fs');
const path = require('path');

/**
 * Change ownership of files and directories recursively.
 * @param {string} dirPath - The path of the directory.
 * @param {number} uid - The user ID.
 * @param {number} gid - The group ID.
 */
function changeOwnershipRecursively(dirPath, uid, gid) {
  fs.lstat(dirPath, (error, stats) => {
    if (error) {
      console.error(`Error reading ${dirPath}:`, error.message);
      return;
    }

    const changeOwnership = (pathToChange) => {
      fs.chown(pathToChange, uid, gid, (error) => {
        if (error) {
          console.error(`Error changing ownership of ${pathToChange}:`, error.message);
        }
      });
    };

    if (stats.isDirectory()) {
      // Change ownership of the directory
      changeOwnership(dirPath);

      // Read the directory contents
      fs.readdir(dirPath, (error, files) => {
        if (error) {
          console.error(`Error reading directory ${dirPath}:`, error.message);
          return;
        }
        
        // Recursively change ownership for contents
        files.forEach((file) => {
          changeOwnershipRecursively(path.join(dirPath, file), uid, gid);
        });
      });
    } else {
      // Change ownership of the file
      changeOwnership(dirPath);
    }
  });
}

module.exports = changeOwnershipRecursively;

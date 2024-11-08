const fs = require('fs');
const path = require('path');

/**
 * Change ownership of files and directories recursively.
 * @param {string} dirPath - The path of the directory.
 * @param {number} uid - The user ID.
 * @param {number} gid - The group ID.
 */
function chownRecursive(dirPath, uid, gid) {
  fs.lstat(dirPath, (err, stats) => {
    if (err) {
      console.error(`Error reading ${dirPath}:`, err.message);
      return;
    }

    if (stats.isDirectory()) {
      // Apply chown to the directory itself
      fs.chown(dirPath, uid, gid, (err) => {
        if (err) {
          console.error(`Error changing ownership of directory ${dirPath}:`, err.message);
        }
      });

      // Read the contents of the directory
      fs.readdir(dirPath, (err, files) => {
        if (err) {
          console.error(`Error reading directory ${dirPath}:`, err.message);
          return;
        }

        // Recursively apply chown to each file/directory inside
        files.forEach((file) => {
          const fullPath = path.join(dirPath, file);
          chownRecursive(fullPath, uid, gid);
        });
      });
    } else {
      // Apply chown directly to the file
      fs.chown(dirPath, uid, gid, (err) => {
        if (err) {
          console.error(`Error changing ownership of file ${dirPath}:`, err.message);
        }
      });
    }
  });
}

// Export the function for external use
module.exports = chownRecursive;

const path = require('path');
const fs = require('fs');
const util = require('util');

const getStats = util.promisify(fs.stat);
const readDir = util.promisify(fs.readdir);

module.exports = async function findInDirectoriesUpwards(startDirectory, callback) {
    // Resolve the starting directory path 
    let currentDir = path.resolve('.', startDirectory);
    let directoryStats = await getStats(currentDir);

    // Adjust path if not a directory
    if (!directoryStats.isDirectory()) {
        currentDir = path.dirname(currentDir);
    }

    while (true) {
        const potentialResult = await callback(currentDir, await readDir(currentDir));
        if (potentialResult) {
            // Return resolved path if the callback gives a truthy result
            return path.resolve(currentDir, potentialResult);
        }
        // Move to parent directory
        const parentDir = path.dirname(currentDir);
        if (parentDir === currentDir) {
            // Stop if the root directory is reached
            break;
        }
        currentDir = parentDir;
    }
}

const { dirname, resolve } = require('path');
const { readdir, stat } = require('fs').promises;

module.exports = async function findInDirectories(start, callback) {
    let currentDir = resolve('.', start);
    
    try {
        let stats = await stat(currentDir);
        
        // If the starting point is not a directory, move one level up
        if (!stats.isDirectory()) {
            currentDir = dirname(currentDir);
        }

        // Loop through directories, checking each with the callback function
        while (true) {
            const dirContents = await readdir(currentDir);
            const result = await callback(currentDir, dirContents);
            
            if (result) {
                return resolve(currentDir, result);
            }
            
            const parentDir = dirname(currentDir);
            
            // Check if the current directory is the root
            if (currentDir === parentDir) {
                break;
            }
            
            currentDir = parentDir;
        }
    } catch (error) {
        console.error("Error during directory traversal:", error);
        throw error; // Rethrow error after logging
    }
};

const path = require('path');
const fs = require('fs').promises;

module.exports = async function searchUpwards(start, callback) {
    let currentDir = path.resolve('.', start);

    try {
        let stats = await fs.stat(currentDir);
        if (!stats.isDirectory()) {
            currentDir = path.dirname(currentDir);
        }

        while (true) {
            const files = await fs.readdir(currentDir);
            const result = await callback(currentDir, files);
            if (result) {
                return path.resolve(currentDir, result);
            }
            const parentDir = path.dirname(currentDir);
            if (currentDir === parentDir) {
                break;
            }
            currentDir = parentDir;
        }
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
};

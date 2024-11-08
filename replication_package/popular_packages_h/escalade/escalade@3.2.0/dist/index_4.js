const { dirname, resolve } = require('path');
const { readdir, stat } = require('fs').promises;

module.exports = async function traverseDirectories(start, callback) {
    let dir = resolve('.', start);

    try {
        let stats = await stat(dir);

        if (!stats.isDirectory()) {
            dir = dirname(dir);
        }

        while (true) {
            const files = await readdir(dir);
            const result = await callback(dir, files);
            if (result) return resolve(dir, result);

            const parentDir = dirname(dir);
            if (parentDir === dir) break;
            dir = parentDir;
        }
    } catch (error) {
        console.error('Error traversing directories:', error);
    }
}

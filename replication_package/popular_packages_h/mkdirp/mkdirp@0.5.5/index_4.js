const path = require('path');
const fs = require('fs');

const DEFAULT_MODE = 0o777;

function mkdirP(directoryPath, opts = {}, callback = () => {}) {
    if (typeof opts === 'function') {
        callback = opts;
        opts = {};
    }

    const { mode = DEFAULT_MODE, fs: xfs = fs } = opts;
    const resolvedPath = path.resolve(directoryPath);
    const createDir = (dirPath, cb) => {
        xfs.mkdir(dirPath, mode, (err) => {
            if (!err) return cb(null, dirPath);
            if (err.code === 'ENOENT') {
                createDir(path.dirname(dirPath), (err) => {
                    if (err) return cb(err);
                    createDir(dirPath, cb);
                });
            } else {
                xfs.stat(dirPath, (err2, stat) => {
                    if (err2 || !stat.isDirectory()) return cb(err);
                    cb(null, dirPath);
                });
            }
        });
    };

    createDir(resolvedPath, callback);
}

mkdirP.sync = function (directoryPath, opts = {}) {
    const { mode = DEFAULT_MODE, fs: xfs = fs } = opts;
    const resolvedPath = path.resolve(directoryPath);

    const createSyncDir = (dirPath) => {
        try {
            xfs.mkdirSync(dirPath, mode);
            return dirPath;
        } catch (err) {
            if (err.code === 'ENOENT') {
                createSyncDir(path.dirname(dirPath));
                return createSyncDir(dirPath);
            }
            try {
                if (!xfs.statSync(dirPath).isDirectory()) throw err;
            } catch (err1) {
                throw err;
            }
        }
        return dirPath;
    };

    return createSyncDir(resolvedPath);
};

module.exports = mkdirP;

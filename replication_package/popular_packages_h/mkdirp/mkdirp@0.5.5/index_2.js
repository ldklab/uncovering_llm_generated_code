const path = require('path');
const fs = require('fs');

const DEFAULT_MODE = parseInt('0777', 8);

module.exports = mkdirP;
mkdirP.sync = mkdirPSync;

function mkdirP(dirPath, options = {}, callback = () => {}, made = null) {
    if (typeof options === 'function') {
        callback = options;
        options = {};
    }

    let mode = options.mode !== undefined ? options.mode : DEFAULT_MODE;
    const xfs = options.fs || fs;
    dirPath = path.resolve(dirPath);

    xfs.mkdir(dirPath, mode, (error) => {
        if (!error) {
            return callback(null, made || dirPath);
        }

        switch (error.code) {
            case 'ENOENT':
                mkdirP(path.dirname(dirPath), options, (mkdirError, mkdirMade) => {
                    if (mkdirError) {
                        callback(mkdirError);
                    } else {
                        mkdirP(dirPath, options, callback, mkdirMade);
                    }
                });
                break;
            default:
                xfs.stat(dirPath, (statError, stats) => {
                    if (statError || !stats.isDirectory()) {
                        callback(error);
                    } else {
                        callback(null, made);
                    }
                });
        }
    });
}

function mkdirPSync(dirPath, options = {}, made = null) {
    let mode = options.mode !== undefined ? options.mode : DEFAULT_MODE;
    const xfs = options.fs || fs;
    dirPath = path.resolve(dirPath);

    try {
        xfs.mkdirSync(dirPath, mode);
        made = made || dirPath;
    } catch (error) {
        if (error.code === 'ENOENT') {
            made = mkdirPSync(path.dirname(dirPath), options, made);
            mkdirPSync(dirPath, options, made);
        } else {
            try {
                const stats = xfs.statSync(dirPath);
                if (!stats.isDirectory()) {
                    throw error;
                }
            } catch {
                throw error;
            }
        }
    }

    return made;
}

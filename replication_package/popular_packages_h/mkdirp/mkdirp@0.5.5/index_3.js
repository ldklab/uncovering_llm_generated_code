const path = require('path');
const fs = require('fs');
const DEFAULT_MODE = parseInt('0777', 8);

function mkdirP(p, opts = {}, callback = () => {}, made = null) {
    const { mode = DEFAULT_MODE, fs: xfs = fs } = opts;
    p = path.resolve(p);

    xfs.mkdir(p, mode, (error) => {
        if (!error) {
            return callback(null, made || p);
        }

        switch (error.code) {
            case 'ENOENT':
                return path.dirname(p) === p 
                    ? callback(error)
                    : mkdirP(path.dirname(p), opts, (err, madePath) => {
                        if (err) return callback(err, madePath);
                        mkdirP(p, opts, callback, madePath);
                    });

            default:
                xfs.stat(p, (statError, stats) => {
                    if (statError || !stats.isDirectory()) {
                        return callback(error, made);
                    }
                    callback(null, made);
                });
        }
    });
}

mkdirP.sync = function sync(p, opts = {}, made = null) {
    const { mode = DEFAULT_MODE, fs: xfs = fs } = opts;
    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        made = p;
    } catch (error) {
        switch (error.code) {
            case 'ENOENT':
                made = sync(path.dirname(p), opts, made);
                sync(p, opts, made);
                break;

            default:
                const stats = xfs.statSync(p);
                if (!stats.isDirectory()) {
                    throw error;
                }
        }
    }
    return made;
};

module.exports = mkdirP;

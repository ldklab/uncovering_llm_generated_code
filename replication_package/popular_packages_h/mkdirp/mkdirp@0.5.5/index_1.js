const path = require('path');
const fs = require('fs');
const _0777 = parseInt('0777', 8);

module.exports = mkdirP.mkdirp = mkdirP.mkdirP = mkdirP;

function mkdirP(p, opts, callback, createdDir = null) {
    if (typeof opts === 'function') {
        callback = opts;
        opts = {};
    } else if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    const mode = opts.mode !== undefined ? opts.mode : _0777;
    const xfs = opts.fs || fs;
    const cb = callback || (() => {});

    p = path.resolve(p);

    xfs.mkdir(p, mode, (err) => {
        if (!err) {
            createdDir = createdDir || p;
            return cb(null, createdDir);
        }
        if (err.code === 'ENOENT') {
            if (path.dirname(p) === p) return cb(err);
            return mkdirP(path.dirname(p), opts, (er, made) => {
                if (er) cb(er, made);
                else mkdirP(p, opts, cb, made);
            });
        }
        xfs.stat(p, (er2, stats) => {
            if (er2 || !stats.isDirectory()) cb(err, createdDir);
            else cb(null, createdDir);
        });
    });
}

mkdirP.sync = function sync(p, opts, createdDir = null) {
    if (!opts || typeof opts !== 'object') {
        opts = { mode: opts };
    }

    const mode = opts.mode !== undefined ? opts.mode : _0777;
    const xfs = opts.fs || fs;

    p = path.resolve(p);

    try {
        xfs.mkdirSync(p, mode);
        createdDir = createdDir || p;
    } catch (err) {
        if (err.code === 'ENOENT') {
            createdDir = sync(path.dirname(p), opts, createdDir);
            sync(p, opts, createdDir);
        } else {
            let stats;
            try {
                stats = xfs.statSync(p);
            } catch (err1) {
                throw err;
            }
            if (!stats.isDirectory()) throw err;
        }
    }

    return createdDir;
};

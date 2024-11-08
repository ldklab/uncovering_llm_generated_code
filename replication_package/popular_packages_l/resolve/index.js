const fs = require('fs');
const path = require('path');

// Asynchronous implementation
function resolve(id, opts = {}, cb) {
    const options = { ...defaultOptions, ...opts };
    _resolve(id, options, cb);
}

function _resolve(id, opts, cb) {
    const start = opts.basedir || path.dirname(module.parent.filename);
    let paths = generateCandidates(id, start, opts);

    (function findNextCandidate(paths) {
        if (!paths.length) {
            return cb(new Error(`MODULE_NOT_FOUND: Module ${id} not found`));
        }
        const currentPath = paths.shift();
        opts.isFile(currentPath, function (err, exists) {
            if (err) {
                return cb(err);
            }
            if (exists) {
                return cb(null, currentPath);
            }
            findNextCandidate(paths);
        });
    })(paths);
}

// Synchronous implementation
function resolveSync(id, opts = {}) {
    const options = { ...defaultOptions, ...opts };
    return _resolveSync(id, options);
}

function _resolveSync(id, opts) {
    const start = opts.basedir || path.dirname(module.parent.filename);
    const paths = generateCandidates(id, start, opts);

    for (let i = 0; i < paths.length; i++) {
        const currentPath = paths[i];
        if (opts.isFile(currentPath)) {
            return currentPath;
        }
    }
    throw new Error(`MODULE_NOT_FOUND: Module ${id} not found`);
}

function generateCandidates(id, start, opts) {
    let paths = [];
    let extensions = opts.extensions || ['.js'];
    let dir = start;

    while (dir !== path.parse(dir).root) {
        opts.moduleDirectory.forEach((moduleDir) => {
            extensions.forEach((ext) => {
                paths.push(path.join(dir, moduleDir, id + ext));
            });
        });
        dir = path.dirname(dir);
    }

    return paths;
}

const defaultOptions = {
    basedir: __dirname,
    extensions: ['.js'],
    includeCoreModules: true,
    isFile: function (file, cb) {
        fs.stat(file, function (err, stat) {
            if (err) return cb(err);
            cb(null, stat.isFile() || stat.isFIFO());
        });
    },
    isDirectory: function (dir, cb) {
        fs.stat(dir, function (err, stat) {
            if (err) return cb(null, false);
            cb(null, stat.isDirectory());
        });
    },
    moduleDirectory: ['node_modules']
};

module.exports = resolve;
module.exports.sync = resolveSync;

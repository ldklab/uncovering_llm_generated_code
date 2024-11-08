const fs = require('fs');
const path = require('path');

// Asynchronous module resolver
function resolve(id, opts = {}, cb) {
    const options = { ...defaultOptions, ...opts };
    findModuleAsync(id, options, cb);
}

function findModuleAsync(id, opts, cb) {
    const baseDir = opts.basedir || path.dirname(module.parent.filename);
    const candidatePaths = computePotentialPaths(id, baseDir, opts);

    (function attemptNext(paths) {
        if (!paths.length) return cb(new Error(`MODULE_NOT_FOUND: Unable to locate ${id}`));
        
        const current = paths.shift();
        opts.isFile(current, (err, exists) => {
            if (err) return cb(err);
            if (exists) return cb(null, current);
            attemptNext(paths);
        });
    })(candidatePaths);
}

// Synchronous module resolver
function resolveSync(id, opts = {}) {
    const options = { ...defaultOptions, ...opts };
    return findModuleSync(id, options);
}

function findModuleSync(id, opts) {
    const baseDir = opts.basedir || path.dirname(module.parent.filename);
    const candidatePaths = computePotentialPaths(id, baseDir, opts);

    for (let path of candidatePaths) {
        if (opts.isFile(path)) return path;
    }
    throw new Error(`MODULE_NOT_FOUND: Unable to locate ${id}`);
}

// Generate paths for module search
function computePotentialPaths(id, baseDir, opts) {
    let paths = [];
    let dir = baseDir;
    const extensions = opts.extensions || ['.js'];

    while (dir !== path.parse(dir).root) {
        for (let moduleDir of opts.moduleDirectory) {
            for (let ext of extensions) {
                paths.push(path.join(dir, moduleDir, id + ext));
            }
        }
        dir = path.dirname(dir);
    }

    return paths;
}

const defaultOptions = {
    basedir: __dirname,
    extensions: ['.js'],
    includeCoreModules: true,
    isFile(file, cb) {
        fs.stat(file, (err, stat) => {
            if (err) return cb(err);
            cb(null, stat.isFile() || stat.isFIFO());
        });
    },
    isDirectory(dir, cb) {
        fs.stat(dir, (err, stat) => {
            if (err) return cb(null, false);
            cb(null, stat.isDirectory());
        });
    },
    moduleDirectory: ['node_modules']
};

module.exports = resolve;
module.exports.sync = resolveSync;

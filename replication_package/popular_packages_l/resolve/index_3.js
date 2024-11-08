const fs = require('fs');
const path = require('path');

// Asynchronous module resolver
function resolve(id, opts = {}, cb) {
    const options = { ...defaultOptions, ...opts };
    let candidates = generateCandidates(id, options.basedir || path.dirname(module.parent.filename), options);
    (function findNext(paths) {
        if (!paths.length) return cb(new Error(`MODULE_NOT_FOUND: Module ${id} not found`));
        let current = paths.shift();
        options.isFile(current, (err, exists) => {
            if (err) return cb(err);
            if (exists) return cb(null, current);
            findNext(paths);
        });
    })(candidates);
}

// Synchronous module resolver
function resolveSync(id, opts = {}) {
    const options = { ...defaultOptions, ...opts };
    let candidates = generateCandidates(id, options.basedir || path.dirname(module.parent.filename), options);
    for (let path of candidates) {
        if (options.isFile(path)) return path;
    }
    throw new Error(`MODULE_NOT_FOUND: Module ${id} not found`);
}

// Generate potential file paths for a module
function generateCandidates(id, start, opts) {
    let paths = [], dir = start;
    while (dir !== path.parse(dir).root) {
        for (let dirName of opts.moduleDirectory) {
            for (let ext of (opts.extensions || ['.js'])) {
                paths.push(path.join(dir, dirName, id + ext));
            }
        }
        dir = path.dirname(dir);
    }
    return paths;
}

// Default options for module resolution
const defaultOptions = {
    basedir: __dirname,
    extensions: ['.js'],
    moduleDirectory: ['node_modules'],
    isFile: (file, cb) => fs.stat(file, (err, stat) => cb(null, !err && (stat.isFile() || stat.isFIFO())))
};

module.exports = resolve;
module.exports.sync = resolveSync;

const fs = require('fs');
const path = require('path');

// Default options for resolving modules
const defaultOptions = {
    basedir: __dirname,
    extensions: ['.js'],
    includeCoreModules: true,
    isFile: (file, cb) => {
        fs.stat(file, (err, stat) => {
            if (err) return cb(err);
            cb(null, stat.isFile() || stat.isFIFO());
        });
    },
    isDirectory: (dir, cb) => {
        fs.stat(dir, (err, stat) => {
            if (err) return cb(null, false);
            cb(null, stat.isDirectory());
        });
    },
    moduleDirectory: ['node_modules']
};

function generateCandidates(id, start, opts) {
    const paths = [];
    const extensions = opts.extensions || ['.js'];
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

// Asynchronous resolution
function resolve(id, opts = {}, cb) {
    const options = { ...defaultOptions, ...opts };
    const start = options.basedir || path.dirname(module.parent.filename);
    const paths = generateCandidates(id, start, options);

    (function findNext(paths) {
        if (!paths.length) {
            return cb(new Error(`MODULE_NOT_FOUND: Module ${id} not found`));
        }
        
        const currentPath = paths.shift();
        options.isFile(currentPath, (err, exists) => {
            if (err) return cb(err);
            if (exists) return cb(null, currentPath);
            findNext(paths);
        });
    })(paths);
}

// Synchronous resolution
function resolveSync(id, opts = {}) {
    const options = { ...defaultOptions, ...opts };
    const start = options.basedir || path.dirname(module.parent.filename);
    const paths = generateCandidates(id, start, options);

    for (const currentPath of paths) {
        if (options.isFile(currentPath)) {
            return currentPath;
        }
    }

    throw new Error(`MODULE_NOT_FOUND: Module ${id} not found`);
}

module.exports = resolve;
module.exports.sync = resolveSync;

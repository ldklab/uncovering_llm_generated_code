const fs = require('fs');
const path = require('path');

// Function to resolve module path asynchronously
function resolve(id, options = {}, callback) {
    const opts = { ...defaultOptions, ...options };
    resolveModuleAsync(id, opts, callback);
}

// Core resolving logic for asynchronous implementation
function resolveModuleAsync(id, opts, callback) {
    const startDir = opts.basedir || path.dirname(module.parent.filename);
    const potentialPaths = generateModulePaths(id, startDir, opts);

    (function checkNextPath(paths) {
        if (!paths.length) {
            return callback(new Error(`MODULE_NOT_FOUND: Cannot find module '${id}'`));
        }
        const current = paths.shift();
        opts.isFile(current, (err, exists) => {
            if (err) return callback(err);
            if (exists) return callback(null, current);
            checkNextPath(paths);
        });
    })(potentialPaths);
}

// Function to resolve module path synchronously
function resolveSync(id, options = {}) {
    const opts = { ...defaultOptions, ...options };
    return resolveModuleSync(id, opts);
}

// Core resolving logic for synchronous implementation
function resolveModuleSync(id, opts) {
    const startDir = opts.basedir || path.dirname(module.parent.filename);
    const potentialPaths = generateModulePaths(id, startDir, opts);

    for (const current of potentialPaths) {
        if (opts.isFile(current)) {
            return current;
        }
    }
    throw new Error(`MODULE_NOT_FOUND: Cannot find module '${id}'`);
}

// Generate potential module paths by iterating over directories upwards
function generateModulePaths(id, startDir, opts) {
    const paths = [];
    const exts = opts.extensions || ['.js'];

    let currentDir = startDir;
    while (currentDir !== path.parse(currentDir).root) {
        for (const moduleDir of opts.moduleDirectory) {
            for (const ext of exts) {
                paths.push(path.join(currentDir, moduleDir, id + ext));
            }
        }
        currentDir = path.dirname(currentDir);
    }

    return paths;
}

// Default options for resolving modules
const defaultOptions = {
    basedir: __dirname,
    extensions: ['.js'],
    includeCoreModules: true,
    isFile: (file, cb) => {
        fs.stat(file, (err, stats) => {
            if (err) return cb(false);
            cb(stats.isFile() || stats.isFIFO());
        });
    },
    isDirectory: (dir, cb) => {
        fs.stat(dir, (err, stats) => {
            if (err) return cb(false);
            cb(stats.isDirectory());
        });
    },
    moduleDirectory: ['node_modules']
};

// Exporting the module resolution functions
module.exports = resolve;
module.exports.sync = resolveSync;

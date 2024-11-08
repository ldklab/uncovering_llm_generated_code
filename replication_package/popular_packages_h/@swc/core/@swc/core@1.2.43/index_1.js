"use strict";

const { compileBundleOptions } = require("./spack");
const { loadBinding } = require("@node-rs/helper");
const packageJson = require("./package.json");
const typesModule = require("./types");

const bindings = loadBinding(__dirname, "swc", "@swc/core");

exports.DEFAULT_EXTENSIONS = Object.freeze([
    ".js",
    ".jsx",
    ".es6",
    ".es",
    ".mjs",
    ".ts",
    ".tsx"
]);

exports.version = packageJson.version;

exports.plugins = function plugins(ps) {
    return mod => {
        return ps.reduce((m, p) => p(m), mod);
    };
};

class Compiler {
    parse(src, options = {}) {
        return new Promise((resolve, reject) => {
            options.syntax = options.syntax || "ecmascript";
            bindings.parse(src, toBuffer(options))
                .then(res => resolve(JSON.parse(res)))
                .catch(reject);
        });
    }

    parseSync(src, options = {}) {
        options.syntax = options.syntax || "ecmascript";
        const result = bindings.parseSync(src, toBuffer(options));
        return JSON.parse(result);
    }

    parseFile(path, options = {}) {
        return new Promise((resolve, reject) => {
            options.syntax = options.syntax || "ecmascript";
            bindings.parseFile(path, toBuffer(options))
                .then(res => resolve(JSON.parse(res)))
                .catch(reject);
        });
    }

    parseFileSync(path, options = {}) {
        options.syntax = options.syntax || "ecmascript";
        return JSON.parse(bindings.parseFileSync(path, toBuffer(options)));
    }

    print(m, options = {}) {
        return bindings.print(JSON.stringify(m), toBuffer(options));
    }

    printSync(m, options = {}) {
        return bindings.printSync(JSON.stringify(m), toBuffer(options));
    }

    transform(src, options = {}) {
        return new Promise((resolve, reject) => {
            const isModule = typeof src !== "string";
            if (options.jsc?.parser) {
                options.jsc.parser.syntax = options.jsc.parser.syntax || 'ecmascript';
            }

            const plugin = options.plugin;
            delete options.plugin;

            if (plugin) {
                const promise = typeof src === "string"
                    ? this.parse(src, options.jsc?.parser)
                    : Promise.resolve(src);

                promise.then(m => this.transform(plugin(m), options))
                    .then(resolve)
                    .catch(reject);
            } else {
                bindings.transform(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options))
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    transformSync(src, options = {}) {
        const isModule = typeof src !== "string";
        if (options.jsc?.parser) {
            options.jsc.parser.syntax = options.jsc.parser.syntax || 'ecmascript';
        }

        const plugin = options.plugin;
        delete options.plugin;

        if (plugin) {
            const m = typeof src === "string" ? this.parseSync(src, options.jsc?.parser) : src;
            return this.transformSync(plugin(m), options);
        }

        return bindings.transformSync(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
    }

    transformFile(path, options = {}) {
        return new Promise((resolve, reject) => {
            if (options.jsc?.parser) {
                options.jsc.parser.syntax = options.jsc.parser.syntax || 'ecmascript';
            }

            const plugin = options.plugin;
            delete options.plugin;

            if (plugin) {
                this.parseFile(path, options.jsc?.parser)
                    .then(m => this.transform(plugin(m), options))
                    .then(resolve)
                    .catch(reject);
            } else {
                bindings.transformFile(path, false, toBuffer(options))
                    .then(resolve)
                    .catch(reject);
            }
        });
    }

    transformFileSync(path, options = {}) {
        if (options.jsc?.parser) {
            options.jsc.parser.syntax = options.jsc.parser.syntax || 'ecmascript';
        }

        const plugin = options.plugin;
        delete options.plugin;

        if (plugin) {
            const m = this.parseFileSync(path, options.jsc?.parser);
            return this.transformSync(plugin(m), options);
        }

        return bindings.transformFileSync(path, false, toBuffer(options));
    }

    bundle(options) {
        return new Promise(async (resolve, reject) => {
            const opts = await compileBundleOptions(options);
            if (Array.isArray(opts)) {
                const allPromises = opts.map(opt => this.bundle(opt));
                try {
                    const allResults = await Promise.all(allPromises);
                    const merged = allResults.reduce((acc, cur) => ({ ...acc, ...cur }), {});
                    resolve(merged);
                } catch (e) {
                    reject(e);
                }
            } else {
                bindings.bundle(toBuffer(opts))
                    .then(resolve)
                    .catch(reject);
            }
        });
    }
}

exports.Compiler = Compiler;

const compiler = new Compiler();

exports.parse = (src, options) => compiler.parse(src, options);
exports.parseSync = (src, options) => compiler.parseSync(src, options);
exports.parseFile = (path, options) => compiler.parseFile(path, options);
exports.parseFileSync = (path, options) => compiler.parseFileSync(path, options);
exports.print = (m, options) => compiler.print(m, options);
exports.printSync = (m, options) => compiler.printSync(m, options);
exports.transform = (src, options) => compiler.transform(src, options);
exports.transformSync = (src, options) => compiler.transformSync(src, options);
exports.transformFile = (path, options) => compiler.transformFile(path, options);
exports.transformFileSync = (path, options) => compiler.transformFileSync(path, options);
exports.bundle = options => compiler.bundle(options);

function toBuffer(t) {
    return Buffer.from(JSON.stringify(t));
}

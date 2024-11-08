"use strict";

const { compileBundleOptions } = require("./spack");
const { loadBinding } = require("@node-rs/helper");

const bindings = loadBinding(__dirname, "swc", "@swc/core");

// Export all from "./types"
Object.assign(exports, require("./types"));

exports.version = require("./package.json").version;

function plugins(ps) {
    return mod => ps.reduce((m, p) => p(m), mod);
}
exports.plugins = plugins;

class Compiler {
    parse(src, options = { syntax: "ecmascript" }) {
        return (async () => {
            options.syntax = options.syntax || "ecmascript";
            const res = await bindings.parse(src, toBuffer(options));
            return JSON.parse(res);
        })();
    }

    parseSync(src, options = { syntax: "ecmascript" }) {
        options.syntax = options.syntax || "ecmascript";
        return JSON.parse(bindings.parseSync(src, toBuffer(options)));
    }

    parseFile(path, options = { syntax: "ecmascript" }) {
        options.syntax = options.syntax || "ecmascript";
        const res = bindings.parseFile(path, toBuffer(options));
        return JSON.parse(res);
    }

    parseFileSync(path, options = { syntax: "ecmascript" }) {
        options.syntax = options.syntax || "ecmascript";
        return JSON.parse(bindings.parseFileSync(path, toBuffer(options)));
    }

    print(m, options = {}) {
        return (async () => bindings.print(JSON.stringify(m), toBuffer(options)))();
    }

    printSync(m, options = {}) {
        return bindings.printSync(JSON.stringify(m), toBuffer(options));
    }

    transform(src, options = {}) {
        const { plugin, jsc } = options;
        if (jsc && jsc.parser) jsc.parser.syntax = jsc.parser.syntax || 'ecmascript';

        return (async () => {
            if (plugin) {
                const m = typeof src === "string" ? 
                    await this.parse(src, jsc ? jsc.parser : undefined) : 
                    src;
                return this.transform(plugin(m), options);
            }
            const isModule = typeof src !== "string";
            return bindings.transform(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
        })();
    }

    transformSync(src, options = {}) {
        const { plugin, jsc } = options;
        if (jsc && jsc.parser) jsc.parser.syntax = jsc.parser.syntax || 'ecmascript';

        if (plugin) {
            const m = typeof src === "string" ? 
                this.parseSync(src, jsc ? jsc.parser : undefined) : 
                src;
            return this.transformSync(plugin(m), options);
        }

        const isModule = typeof src !== "string";
        return bindings.transformSync(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
    }

    transformFile(path, options = {}) {
        const { plugin, jsc } = options;
        if (jsc && jsc.parser) jsc.parser.syntax = jsc.parser.syntax || 'ecmascript';

        return (async () => {
            if (plugin) {
                const m = await this.parseFile(path, jsc ? jsc.parser : undefined);
                return this.transform(plugin(m), options);
            }
            return bindings.transformFile(path, false, toBuffer(options));
        })();
    }

    transformFileSync(path, options = {}) {
        const { plugin, jsc } = options;
        if (jsc && jsc.parser) jsc.parser.syntax = jsc.parser.syntax || 'ecmascript';

        if (plugin) {
            const m = this.parseFileSync(path, jsc ? jsc.parser : undefined);
            return this.transformSync(plugin(m), options);
        }
        return bindings.transformFileSync(path, false, toBuffer(options));
    }

    bundle(options) {
        return (async () => {
            const opts = await compileBundleOptions(options);
            if (Array.isArray(opts)) {
                const all = await Promise.all(opts.map(opt => this.bundle(opt)));
                return Object.assign({}, ...all);
            }
            return bindings.bundle(toBuffer(opts));
        })();
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

exports.DEFAULT_EXTENSIONS = Object.freeze([
    ".js",
    ".jsx",
    ".es6",
    ".es",
    ".mjs",
    ".ts",
    ".tsx"
]);

function toBuffer(t) {
    return Buffer.from(JSON.stringify(t));
}

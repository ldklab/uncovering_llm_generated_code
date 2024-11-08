"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? 
    (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function () { return m[k]; } });
    }) : 
    (function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    })
);

var __exportStar = (this && this.__exportStar) || function (m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

Object.defineProperty(exports, "__esModule", { value: true });

const { compileBundleOptions } = require('./spack');
const { loadBinding } = require('@node-rs/helper');
const bindings = loadBinding(__dirname, "swc", "@swc/core");

exports.version = require("./package.json").version;

function plugins(ps) {
    return mod => ps.reduce((m, p) => p(m), mod);
}

exports.plugins = plugins;

class Compiler {
    parse(src, options = { syntax: "ecmascript" }) {
        return __awaiter(this, void 0, void 0, function* () {
            const res = yield bindings.parse(src, toBuffer(options));
            return JSON.parse(res);
        });
    }

    parseSync(src, options = { syntax: "ecmascript" }) {
        return JSON.parse(bindings.parseSync(src, toBuffer(options)));
    }

    parseFile(path, options = { syntax: "ecmascript" }) {
        const res = bindings.parseFile(path, toBuffer(options));
        return JSON.parse(res);
    }

    parseFileSync(path, options = { syntax: "ecmascript" }) {
        return JSON.parse(bindings.parseFileSync(path, toBuffer(options)));
    }

    print(m, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            return bindings.print(JSON.stringify(m), toBuffer(options));
        });
    }

    printSync(m, options = {}) {
        return bindings.printSync(JSON.stringify(m), toBuffer(options));
    }

    transform(src, options = {}) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const isModule = typeof src !== "string";
            options.jsc.parser.syntax = (_b = (_a = options.jsc).parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';

            if (options.plugin) {
                const m = typeof src === "string" ? yield this.parse(src, options.jsc.parser) : src;
                return this.transform(options.plugin(m), options);
            }

            return bindings.transform(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
        });
    }

    transformSync(src, options = {}) {
        var _a, _b;
        const isModule = typeof src !== "string";
        options.jsc.parser.syntax = (_b = (_a = options.jsc).parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';

        if (options.plugin) {
            const m = typeof src === "string" ? this.parseSync(src, options.jsc.parser) : src;
            return this.transformSync(options.plugin(m), options);
        }

        return bindings.transformSync(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
    }

    transformFile(path, options = {}) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            options.jsc.parser.syntax = (_b = (_a = options.jsc).parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';

            if (options.plugin) {
                const m = yield this.parseFile(path, options.jsc.parser);
                return this.transform(options.plugin(m), options);
            }

            return bindings.transformFile(path, false, toBuffer(options));
        });
    }

    transformFileSync(path, options = {}) {
        var _a, _b;
        options.jsc.parser.syntax = (_b = (_a = options.jsc).parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';

        if (options.plugin) {
            const m = this.parseFileSync(path, options.jsc.parser);
            return this.transformSync(options.plugin(m), options);
        }

        return bindings.transformFileSync(path, false, toBuffer(options));
    }

    bundle(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const opts = yield compileBundleOptions(options);
            if (Array.isArray(opts)) {
                const all = yield Promise.all(opts.map(opt => this.bundle(opt)));
                return all.reduce((obj, o) => Object.assign(obj, o), {});
            }

            return bindings.bundle(toBuffer(opts));
        });
    }
}

exports.Compiler = Compiler;

const compiler = new Compiler();

function parse(src, options) {
    return compiler.parse(src, options);
}

exports.parse = parse;

function parseSync(src, options) {
    return compiler.parseSync(src, options);
}

exports.parseSync = parseSync;

function parseFile(path, options) {
    return compiler.parseFile(path, options);
}

exports.parseFile = parseFile;

function parseFileSync(path, options) {
    return compiler.parseFileSync(path, options);
}

exports.parseFileSync = parseFileSync;

function print(m, options) {
    return compiler.print(m, options);
}

exports.print = print;

function printSync(m, options) {
    return compiler.printSync(m, options);
}

exports.printSync = printSync;

function transform(src, options) {
    return compiler.transform(src, options);
}

exports.transform = transform;

function transformSync(src, options) {
    return compiler.transformSync(src, options);
}

exports.transformSync = transformSync;

function transformFile(path, options) {
    return compiler.transformFile(path, options);
}

exports.transformFile = transformFile;

function transformFileSync(path, options) {
    return compiler.transformFileSync(path, options);
}

exports.transformFileSync = transformFileSync;

function bundle(options) {
    return compiler.bundle(options);
}

exports.bundle = bundle;

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

__exportStar(require("./types"), exports);

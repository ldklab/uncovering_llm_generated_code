"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
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
exports.DEFAULT_EXTENSIONS = exports.bundle = exports.transformFileSync = exports.transformFile = exports.transformSync = exports.transform = exports.printSync = exports.print = exports.parseFileSync = exports.parseFile = exports.parseSync = exports.parse = exports.Compiler = exports.plugins = exports.version = void 0;
__exportStar(require("./types"), exports);
const spack_1 = require("./spack");
const helper_1 = require("@node-rs/helper");
const bindings = helper_1.loadBinding(__dirname, "swc", "@swc/core");
/**
 * Version of the swc binding.
 */
exports.version = require("./package.json").version;
function plugins(ps) {
    return mod => {
        let m = mod;
        for (const p of ps) {
            m = p(m);
        }
        return m;
    };
}
exports.plugins = plugins;
class Compiler {
    parse(src, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || { syntax: "ecmascript" };
            options.syntax = options.syntax || "ecmascript";
            const res = yield bindings.parse(src, toBuffer(options));
            return JSON.parse(res);
        });
    }
    parseSync(src, options) {
        options = options || { syntax: "ecmascript" };
        options.syntax = options.syntax || "ecmascript";
        return JSON.parse(bindings.parseSync(src, toBuffer(options)));
    }
    parseFile(path, options) {
        options = options || { syntax: "ecmascript" };
        options.syntax = options.syntax || "ecmascript";
        const res = bindings.parseFile(path, toBuffer(options));
        return JSON.parse(res);
    }
    parseFileSync(path, options) {
        options = options || { syntax: "ecmascript" };
        options.syntax = options.syntax || "ecmascript";
        return JSON.parse(bindings.parseFileSync(path, toBuffer(options)));
    }
    /**
     * Note: this method should be invoked on the compiler instance used
     *  for `parse()` / `parseSync()`.
     */
    print(m, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            return bindings.print(JSON.stringify(m), toBuffer(options));
        });
    }
    /**
     * Note: this method should be invoked on the compiler instance used
     *  for `parse()` / `parseSync()`.
     */
    printSync(m, options) {
        options = options || {};
        return bindings.printSync(JSON.stringify(m), toBuffer(options));
    }
    transform(src, options) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const isModule = typeof src !== "string";
            options = options || {};
            if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
                options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
            }
            const plugin = options.plugin;
            delete options.plugin;
            if (plugin) {
                const m = typeof src === "string"
                    ? yield this.parse(src, (_c = options === null || options === void 0 ? void 0 : options.jsc) === null || _c === void 0 ? void 0 : _c.parser)
                    : src;
                return this.transform(plugin(m), options);
            }
            return bindings.transform(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
        });
    }
    transformSync(src, options) {
        var _a, _b, _c;
        const isModule = typeof src !== "string";
        options = options || {};
        if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
            options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
        }
        const plugin = options.plugin;
        delete options.plugin;
        if (plugin) {
            const m = typeof src === "string" ? this.parseSync(src, (_c = options === null || options === void 0 ? void 0 : options.jsc) === null || _c === void 0 ? void 0 : _c.parser) : src;
            return this.transformSync(plugin(m), options);
        }
        return bindings.transformSync(isModule ? JSON.stringify(src) : src, isModule, toBuffer(options));
    }
    transformFile(path, options) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
                options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
            }
            const plugin = options.plugin;
            delete options.plugin;
            if (plugin) {
                const m = yield this.parseFile(path, (_c = options === null || options === void 0 ? void 0 : options.jsc) === null || _c === void 0 ? void 0 : _c.parser);
                return this.transform(plugin(m), options);
            }
            return bindings.transformFile(path, false, toBuffer(options));
        });
    }
    transformFileSync(path, options) {
        var _a, _b, _c;
        options = options || {};
        if ((_a = options === null || options === void 0 ? void 0 : options.jsc) === null || _a === void 0 ? void 0 : _a.parser) {
            options.jsc.parser.syntax = (_b = options.jsc.parser.syntax) !== null && _b !== void 0 ? _b : 'ecmascript';
        }
        const plugin = options === null || options === void 0 ? void 0 : options.plugin;
        options === null || options === void 0 ? true : delete options.plugin;
        if (plugin) {
            const m = this.parseFileSync(path, (_c = options === null || options === void 0 ? void 0 : options.jsc) === null || _c === void 0 ? void 0 : _c.parser);
            return this.transformSync(plugin(m), options);
        }
        return bindings.transformFileSync(path, /* isModule */ false, toBuffer(options));
    }
    bundle(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const opts = yield spack_1.compileBundleOptions(options);
            if (Array.isArray(opts)) {
                const all = yield Promise.all(opts.map((opt) => __awaiter(this, void 0, void 0, function* () {
                    return this.bundle(opt);
                })));
                let obj = {};
                for (const o of all) {
                    obj = Object.assign(Object.assign({}, obj), o);
                }
                return obj;
            }
            return bindings.bundle(toBuffer(Object.assign({}, opts)));
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

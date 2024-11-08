"use strict";

function importStar(module) {
    const result = {};
    if (module && module.__esModule) return module;
    if (module != null) {
        for (const key in module) {
            if (key !== "default" && Object.prototype.hasOwnProperty.call(module, key)) {
                Object.defineProperty(result, key, {
                    enumerable: true,
                    get: () => module[key]
                });
            }
        }
    }
    Object.defineProperty(result, "default", { enumerable: true, value: module });
    return result;
}

function exportStar(module, exports) {
    for (const property in module) {
        if (property !== "default" && !Object.prototype.hasOwnProperty.call(exports, property)) {
            Object.defineProperty(exports, property, {
                enumerable: true,
                get: () => module[property]
            });
        }
    }
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.sync = exports.isexe = exports.posix = exports.win32 = void 0;

const posix = importStar(require("./posix.js"));
exports.posix = posix;

const win32 = importStar(require("./win32.js"));
exports.win32 = win32;

exportStar(require("./options.js"), exports);

const platform = process.env._ISEXE_TEST_PLATFORM_ || process.platform;
const impl = platform === 'win32' ? win32 : posix;

exports.isexe = impl.isexe;
exports.sync = impl.sync;

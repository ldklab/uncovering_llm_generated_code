"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

function __createBinding(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}

function __exportStar(m, exports) {
    for (var p in m) {
        if (p !== "default" && !exports.hasOwnProperty(p)) {
            __createBinding(exports, m, p);
        }
    }
}

__exportStar(require("./trace"), exports);

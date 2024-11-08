"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

function __createBinding(o, m, k, k2 = k) {
    const desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || (!m.__esModule && (desc.writable || desc.configurable))) {
        Object.defineProperty(o, k2, { enumerable: true, get: () => m[k] });
    }
}

function __exportStar(m, exports) {
    for (const p in m) {
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) {
            __createBinding(exports, m, p);
        }
    }
}

__exportStar(require("./factory"), exports);
__exportStar(require("./handlers"), exports);
__exportStar(require("./plugins/default"), exports);
__exportStar(require("./legacy"), exports);

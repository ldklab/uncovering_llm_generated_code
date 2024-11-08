"use strict";

function createBinding(o, m, k, k2 = k) {
    let desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}

function exportStar(m, exports) {
    for (let p in m) {
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) {
            createBinding(exports, m, p);
        }
    }
}

Object.defineProperty(exports, "__esModule", { value: true });
exportStar(require("./client/socksclient"), exports);

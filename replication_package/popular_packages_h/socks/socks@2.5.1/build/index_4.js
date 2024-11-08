"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

function exportModule(modulePath, exports) {
    const module = require(modulePath);
    for (const key in module) {
        if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: () => module[key] });
        }
    }
}

exportModule("./client/socksclient", exports);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = void 0;

const z = require("./external");
exports.z = z;

for (const key in z) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(z, key)) {
        exports[key] = z[key];
    }
}

exports.default = z;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const parseModule = require("./parse");
const stringifyModule = require("./stringify");

exports.parse = parseModule.default;
exports.stringify = stringifyModule.default;

for (let key in parseModule) {
    if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
        Object.defineProperty(exports, key, {
            enumerable: true,
            get: () => parseModule[key],
        });
    }
}

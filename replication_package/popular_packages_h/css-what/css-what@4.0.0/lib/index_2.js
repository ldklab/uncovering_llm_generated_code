"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = exports.parse = void 0;

const parseModule = require("./parse");
const parse = parseModule.default;
exports.parse = parse;

const stringifyModule = require("./stringify");
const stringify = stringifyModule.default;
exports.stringify = stringify;

Object.keys(parseModule).forEach(key => {
    if (key !== "default" && !Object.prototype.hasOwnProperty.call(exports, key)) {
        exports[key] = parseModule[key];
    }
});

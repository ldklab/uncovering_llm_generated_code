"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deflate = exports.inflate = void 0;
const util_1 = require("util");
const zlib_1 = require("zlib");
const inflateRaw = util_1.promisify(zlib_1.inflateRaw);
const deflateRaw = util_1.promisify(zlib_1.deflateRaw);
exports.inflate = async (input) => {
    return inflateRaw(input);
};
exports.deflate = async (input) => {
    return deflateRaw(input);
};

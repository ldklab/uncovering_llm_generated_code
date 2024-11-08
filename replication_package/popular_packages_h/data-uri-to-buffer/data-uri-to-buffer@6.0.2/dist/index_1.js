"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataUriToBuffer = void 0;
const common_1 = require("./common");

function base64ToArrayBuffer(base64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const byteArray = [];
    for (let i = 0; i < base64.length; i += 4) {
        const idx0 = chars.indexOf(base64[i]);
        const idx1 = chars.indexOf(base64[i + 1]);
        const idx2 = base64[i + 2] === '=' ? 0 : chars.indexOf(base64[i + 2]);
        const idx3 = base64[i + 3] === '=' ? 0 : chars.indexOf(base64[i + 3]);

        byteArray.push((idx0 << 2) | (idx1 >> 4));
        if (base64[i + 2] !== '=') byteArray.push(((idx1 & 15) << 4) | (idx2 >> 2));
        if (base64[i + 3] !== '=') byteArray.push(((idx2 & 3) << 6) | idx3);
    }

    const buffer = new ArrayBuffer(byteArray.length);
    new Uint8Array(buffer).set(byteArray);
    return buffer;
}

function stringToBuffer(str) {
    const buffer = new ArrayBuffer(str.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
    }
    return buffer;
}

exports.dataUriToBuffer = (0, common_1.makeDataUriToBuffer)({ stringToBuffer, base64ToArrayBuffer });

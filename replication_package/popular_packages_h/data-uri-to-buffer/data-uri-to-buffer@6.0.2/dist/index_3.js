"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataUriToBuffer = void 0;
const common_1 = require("./common");

// Converts a base64 encoded string to an ArrayBuffer
function base64ToArrayBuffer(base64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    const bytes = [];
    
    for (let i = 0; i < base64.length; i += 4) {
        const idx0 = chars.indexOf(base64.charAt(i));
        const idx1 = chars.indexOf(base64.charAt(i + 1));
        
        const idx2 = base64.charAt(i + 2) === '='
            ? 0
            : chars.indexOf(base64.charAt(i + 2));
            
        const idx3 = base64.charAt(i + 3) === '='
            ? 0
            : chars.indexOf(base64.charAt(i + 3));
        
        const bin0 = (idx0 << 2) | (idx1 >> 4);
        const bin1 = ((idx1 & 15) << 4) | (idx2 >> 2);
        const bin2 = ((idx2 & 3) << 6) | idx3;
        
        bytes.push(bin0);
        if (base64.charAt(i + 2) !== '=') bytes.push(bin1);
        if (base64.charAt(i + 3) !== '=') bytes.push(bin2);
    }
    
    const buffer = new ArrayBuffer(bytes.length);
    const view = new Uint8Array(buffer);
    view.set(bytes);
    
    return buffer;
}

// Converts a string to an ArrayBuffer
function stringToBuffer(str) {
    const buffer = new ArrayBuffer(str.length);
    const view = new Uint8Array(buffer);
    
    for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
    }
    
    return buffer;
}

// Export a function that converts a data URI `uri` to a Buffer instance
exports.dataUriToBuffer = (0, common_1.makeDataUriToBuffer)({ stringToBuffer, base64ToArrayBuffer });

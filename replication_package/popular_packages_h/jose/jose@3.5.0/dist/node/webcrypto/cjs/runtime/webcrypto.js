"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureSecureContext = void 0;
const crypto = require("crypto");
if (crypto.webcrypto === undefined) {
    throw new Error('Node.js crypto.webcrypto is not available in your runtime');
}
process.emitWarning('The implementation of Web Cryptography API in Node.js is experimental.', 'ExperimentalWarning');
exports.default = crypto.webcrypto;
function ensureSecureContext() { }
exports.ensureSecureContext = ensureSecureContext;

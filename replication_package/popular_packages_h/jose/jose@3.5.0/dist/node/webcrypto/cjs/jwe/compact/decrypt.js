"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const decrypt_js_1 = require("../flattened/decrypt.js");
const errors_js_1 = require("../../util/errors.js");
const buffer_utils_js_1 = require("../../lib/buffer_utils.js");
async function compactDecrypt(jwe, key, options) {
    if (jwe instanceof Uint8Array) {
        jwe = buffer_utils_js_1.decoder.decode(jwe);
    }
    if (typeof jwe !== 'string') {
        throw new errors_js_1.JWEInvalid('Compact JWE must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag, length } = jwe.split('.');
    if (length !== 5) {
        throw new errors_js_1.JWEInvalid('Invalid Compact JWE');
    }
    const decrypted = await decrypt_js_1.default({
        ciphertext: (ciphertext || undefined),
        iv: (iv || undefined),
        protected: protectedHeader || undefined,
        tag: (tag || undefined),
        encrypted_key: encryptedKey || undefined,
    }, key, options);
    return { plaintext: decrypted.plaintext, protectedHeader: decrypted.protectedHeader };
}
exports.default = compactDecrypt;

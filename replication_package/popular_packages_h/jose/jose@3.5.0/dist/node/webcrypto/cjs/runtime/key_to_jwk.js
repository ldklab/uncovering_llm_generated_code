"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webcrypto_js_1 = require("./webcrypto.js");
const keyToJWK = async (key) => {
    if (!key.extractable) {
        throw new TypeError('non-extractable key cannot be extracted as a JWK');
    }
    webcrypto_js_1.ensureSecureContext();
    const { ext, key_ops, alg, use, ...jwk } = await webcrypto_js_1.default.subtle.exportKey('jwk', key);
    return jwk;
};
exports.default = keyToJWK;

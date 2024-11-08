"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base64url_js_1 = require("../runtime/base64url.js");
const key_to_jwk_js_1 = require("../runtime/key_to_jwk.js");
async function fromKeyLike(key) {
    if (key instanceof Uint8Array) {
        return {
            kty: 'oct',
            k: base64url_js_1.encode(key),
        };
    }
    return key_to_jwk_js_1.default(key);
}
exports.default = fromKeyLike;

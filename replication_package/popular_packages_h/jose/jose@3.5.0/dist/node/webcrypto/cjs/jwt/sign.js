"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sign_js_1 = require("../jws/compact/sign.js");
const errors_js_1 = require("../util/errors.js");
const buffer_utils_js_1 = require("../lib/buffer_utils.js");
const jwt_producer_js_1 = require("../lib/jwt_producer.js");
class SignJWT extends jwt_producer_js_1.default {
    setProtectedHeader(protectedHeader) {
        this._protectedHeader = protectedHeader;
        return this;
    }
    async sign(key, options) {
        const sig = new sign_js_1.default(buffer_utils_js_1.encoder.encode(JSON.stringify(this._payload)));
        sig.setProtectedHeader(this._protectedHeader);
        if (this._protectedHeader.crit?.includes('b64') && this._protectedHeader.b64 === false) {
            throw new errors_js_1.JWTInvalid('JWTs MUST NOT use unencoded payload');
        }
        return sig.sign(key, options);
    }
}
exports.default = SignJWT;

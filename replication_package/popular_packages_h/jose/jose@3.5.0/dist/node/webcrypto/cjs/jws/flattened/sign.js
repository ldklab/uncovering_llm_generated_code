"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_disjoint_js_1 = require("../../lib/is_disjoint.js");
const errors_js_1 = require("../../util/errors.js");
const buffer_utils_js_1 = require("../../lib/buffer_utils.js");
const base64url_js_1 = require("../../runtime/base64url.js");
const sign_js_1 = require("../../runtime/sign.js");
const check_key_type_js_1 = require("../../lib/check_key_type.js");
const validate_crit_js_1 = require("../../lib/validate_crit.js");
const checkExtensions = validate_crit_js_1.default.bind(undefined, errors_js_1.JWSInvalid, new Map([['b64', true]]));
class FlattenedSign {
    constructor(payload) {
        this._payload = payload;
    }
    setProtectedHeader(protectedHeader) {
        if (this._protectedHeader) {
            throw new TypeError('setProtectedHeader can only be called once');
        }
        this._protectedHeader = protectedHeader;
        return this;
    }
    setUnprotectedHeader(unprotectedHeader) {
        if (this._unprotectedHeader) {
            throw new TypeError('setUnprotectedHeader can only be called once');
        }
        this._unprotectedHeader = unprotectedHeader;
        return this;
    }
    async sign(key, options) {
        if (!this._protectedHeader && !this._unprotectedHeader) {
            throw new errors_js_1.JWSInvalid('either setProtectedHeader or setUnprotectedHeader must be called before #sign()');
        }
        if (!is_disjoint_js_1.default(this._protectedHeader, this._unprotectedHeader)) {
            throw new errors_js_1.JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
        }
        const joseHeader = {
            ...this._protectedHeader,
            ...this._unprotectedHeader,
        };
        const extensions = checkExtensions(options?.crit, this._protectedHeader, joseHeader);
        let b64 = true;
        if (extensions.has('b64')) {
            b64 = this._protectedHeader.b64;
            if (typeof b64 !== 'boolean') {
                throw new errors_js_1.JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
            }
        }
        const { alg } = joseHeader;
        if (typeof alg !== 'string' || !alg) {
            throw new errors_js_1.JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
        }
        check_key_type_js_1.default(alg, key);
        let payload = this._payload;
        if (b64) {
            payload = buffer_utils_js_1.encoder.encode(base64url_js_1.encode(payload));
        }
        let protectedHeader;
        if (this._protectedHeader) {
            protectedHeader = buffer_utils_js_1.encoder.encode(base64url_js_1.encode(JSON.stringify(this._protectedHeader)));
        }
        else {
            protectedHeader = buffer_utils_js_1.encoder.encode('');
        }
        const data = buffer_utils_js_1.concat(protectedHeader, buffer_utils_js_1.encoder.encode('.'), payload);
        const signature = await sign_js_1.default(alg, key, data);
        const jws = {
            signature: base64url_js_1.encode(signature),
        };
        if (b64) {
            jws.payload = buffer_utils_js_1.decoder.decode(payload);
        }
        if (this._unprotectedHeader) {
            jws.header = this._unprotectedHeader;
        }
        if (this._protectedHeader) {
            jws.protected = buffer_utils_js_1.decoder.decode(protectedHeader);
        }
        return jws;
    }
}
exports.default = FlattenedSign;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sign_js_1 = require("../flattened/sign.js");
const errors_js_1 = require("../../util/errors.js");
const signatureRef = new WeakMap();
class IndividualSignature {
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
    set _protectedHeader(value) {
        signatureRef.get(this).protectedHeader = value;
    }
    get _protectedHeader() {
        return signatureRef.get(this).protectedHeader;
    }
    set _unprotectedHeader(value) {
        signatureRef.get(this).unprotectedHeader = value;
    }
    get _unprotectedHeader() {
        return signatureRef.get(this).unprotectedHeader;
    }
}
class GeneralSign {
    constructor(payload) {
        this._signatures = [];
        this._payload = payload;
    }
    addSignature(key, options) {
        const signature = new IndividualSignature();
        signatureRef.set(signature, { key, options });
        this._signatures.push(signature);
        return signature;
    }
    async sign() {
        const jws = {
            signatures: [],
        };
        await Promise.all(this._signatures.map(async (sig, i) => {
            const { protectedHeader, unprotectedHeader, options, key } = signatureRef.get(sig);
            const flattened = new sign_js_1.default(this._payload);
            if (protectedHeader) {
                flattened.setProtectedHeader(protectedHeader);
            }
            if (unprotectedHeader) {
                flattened.setUnprotectedHeader(unprotectedHeader);
            }
            const { payload, ...rest } = await flattened.sign(key, options);
            if ('payload' in jws && jws.payload !== payload) {
                throw new errors_js_1.JWSInvalid(`index ${i} signature produced a different payload`);
            }
            else {
                jws.payload = payload;
            }
            jws.signatures.push(rest);
        }));
        if ('payload' in jws && jws.payload === undefined) {
            delete jws.payload;
        }
        return jws;
    }
}
exports.default = GeneralSign;

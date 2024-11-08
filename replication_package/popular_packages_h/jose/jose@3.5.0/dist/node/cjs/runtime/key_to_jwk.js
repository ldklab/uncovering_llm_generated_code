"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const base64url_js_1 = require("./base64url.js");
const asn1_sequence_decoder_js_1 = require("./asn1_sequence_decoder.js");
const errors_js_1 = require("../util/errors.js");
const get_named_curve_js_1 = require("./get_named_curve.js");
const keyToJWK = (key) => {
    if (!(key instanceof crypto_1.KeyObject)) {
        throw new TypeError('invalid key argument type');
    }
    switch (key.type) {
        case 'secret':
            return {
                kty: 'oct',
                k: base64url_js_1.encode(key.export()),
            };
        case 'private':
        case 'public': {
            switch (key.asymmetricKeyType) {
                case 'rsa': {
                    const der = key.export({ format: 'der', type: 'pkcs1' });
                    const dec = new asn1_sequence_decoder_js_1.default(der);
                    if (key.type === 'private') {
                        dec.unsignedInteger();
                    }
                    const n = base64url_js_1.encode(dec.unsignedInteger());
                    const e = base64url_js_1.encode(dec.unsignedInteger());
                    let jwk;
                    if (key.type === 'private') {
                        jwk = {
                            d: base64url_js_1.encode(dec.unsignedInteger()),
                            p: base64url_js_1.encode(dec.unsignedInteger()),
                            q: base64url_js_1.encode(dec.unsignedInteger()),
                            dp: base64url_js_1.encode(dec.unsignedInteger()),
                            dq: base64url_js_1.encode(dec.unsignedInteger()),
                            qi: base64url_js_1.encode(dec.unsignedInteger()),
                        };
                    }
                    dec.end();
                    return { kty: 'RSA', n, e, ...jwk };
                }
                case 'ec': {
                    const crv = get_named_curve_js_1.default(key);
                    let len;
                    let offset;
                    let correction;
                    switch (crv) {
                        case 'secp256k1':
                            len = 64;
                            offset = 31 + 2;
                            correction = -1;
                            break;
                        case 'P-256':
                            len = 64;
                            offset = 34 + 2;
                            correction = -1;
                            break;
                        case 'P-384':
                            len = 96;
                            offset = 33 + 2;
                            correction = -3;
                            break;
                        case 'P-521':
                            len = 132;
                            offset = 33 + 2;
                            correction = -3;
                            break;
                        default:
                            throw new errors_js_1.JOSENotSupported('unsupported curve');
                    }
                    if (key.type === 'public') {
                        const der = key.export({ type: 'spki', format: 'der' });
                        return {
                            kty: 'EC',
                            crv,
                            x: base64url_js_1.encode(der.subarray(-len, -len / 2)),
                            y: base64url_js_1.encode(der.subarray(-len / 2)),
                        };
                    }
                    const der = key.export({ type: 'pkcs8', format: 'der' });
                    if (der.length < 100) {
                        offset += correction;
                    }
                    return {
                        ...keyToJWK(crypto_1.createPublicKey(key)),
                        d: base64url_js_1.encode(der.subarray(offset, offset + len / 2)),
                    };
                }
                case 'ed25519':
                case 'x25519': {
                    const crv = get_named_curve_js_1.default(key);
                    if (key.type === 'public') {
                        const der = key.export({ type: 'spki', format: 'der' });
                        return {
                            kty: 'OKP',
                            crv,
                            x: base64url_js_1.encode(der.subarray(-32)),
                        };
                    }
                    const der = key.export({ type: 'pkcs8', format: 'der' });
                    return {
                        ...keyToJWK(crypto_1.createPublicKey(key)),
                        d: base64url_js_1.encode(der.subarray(-32)),
                    };
                }
                case 'ed448':
                case 'x448': {
                    const crv = get_named_curve_js_1.default(key);
                    if (key.type === 'public') {
                        const der = key.export({ type: 'spki', format: 'der' });
                        return {
                            kty: 'OKP',
                            crv,
                            x: base64url_js_1.encode(der.subarray(crv === 'Ed448' ? -57 : -56)),
                        };
                    }
                    const der = key.export({ type: 'pkcs8', format: 'der' });
                    return {
                        ...keyToJWK(crypto_1.createPublicKey(key)),
                        d: base64url_js_1.encode(der.subarray(crv === 'Ed448' ? -57 : -56)),
                    };
                }
                default:
                    throw new errors_js_1.JOSENotSupported('unsupported key asymmetricKeyType');
            }
        }
        default:
            throw new errors_js_1.JOSENotSupported('unsupported key type');
    }
};
exports.default = keyToJWK;

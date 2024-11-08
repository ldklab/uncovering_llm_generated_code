"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ecdhAllowed = exports.publicJwkToEphemeralKey = exports.generateEpk = exports.ephemeralKeyToPublicJWK = exports.deriveKey = void 0;
const buffer_utils_js_1 = require("../lib/buffer_utils.js");
const webcrypto_js_1 = require("./webcrypto.js");
const digest_js_1 = require("./digest.js");
const concatKdf = buffer_utils_js_1.concatKdf.bind(undefined, digest_js_1.default.bind(undefined, 'sha256'));
exports.deriveKey = async (publicKey, privateKey, algorithm, keyLength, apu = new Uint8Array(), apv = new Uint8Array()) => {
    webcrypto_js_1.ensureSecureContext();
    const value = buffer_utils_js_1.concat(buffer_utils_js_1.lengthAndInput(buffer_utils_js_1.encoder.encode(algorithm)), buffer_utils_js_1.lengthAndInput(apu), buffer_utils_js_1.lengthAndInput(apv), buffer_utils_js_1.uint32be(keyLength));
    if (!privateKey.usages.includes('deriveBits')) {
        throw new TypeError('ECDH-ES private key "usages" must include "deriveBits"');
    }
    const sharedSecret = new Uint8Array(await webcrypto_js_1.default.subtle.deriveBits({
        name: 'ECDH',
        public: publicKey,
    }, privateKey, Math.ceil(parseInt(privateKey.algorithm.namedCurve.substr(-3), 10) / 8) <<
        3));
    return concatKdf(sharedSecret, keyLength, value);
};
exports.ephemeralKeyToPublicJWK = async function ephemeralKeyToPublicJWK(key) {
    webcrypto_js_1.ensureSecureContext();
    const { crv, kty, x, y } = await webcrypto_js_1.default.subtle.exportKey('jwk', key);
    return { crv, kty, x, y };
};
exports.generateEpk = async (key) => {
    webcrypto_js_1.ensureSecureContext();
    return (await webcrypto_js_1.default.subtle.generateKey({ name: 'ECDH', namedCurve: key.algorithm.namedCurve }, true, ['deriveBits'])).privateKey;
};
exports.publicJwkToEphemeralKey = async (jwk) => {
    webcrypto_js_1.ensureSecureContext();
    return webcrypto_js_1.default.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: jwk.crv }, true, []);
};
const curves = ['P-256', 'P-384', 'P-521'];
exports.ecdhAllowed = (key) => curves.includes(key.algorithm.namedCurve);

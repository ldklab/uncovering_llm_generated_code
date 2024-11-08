import { encoder, concat, uint32be, lengthAndInput, concatKdf as KDF, } from '../lib/buffer_utils.js';
import crypto, { ensureSecureContext } from './webcrypto.js';
import digest from './digest.js';
const concatKdf = KDF.bind(undefined, digest.bind(undefined, 'sha256'));
export const deriveKey = async (publicKey, privateKey, algorithm, keyLength, apu = new Uint8Array(), apv = new Uint8Array()) => {
    ensureSecureContext();
    const value = concat(lengthAndInput(encoder.encode(algorithm)), lengthAndInput(apu), lengthAndInput(apv), uint32be(keyLength));
    if (!privateKey.usages.includes('deriveBits')) {
        throw new TypeError('ECDH-ES private key "usages" must include "deriveBits"');
    }
    const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({
        name: 'ECDH',
        public: publicKey,
    }, privateKey, Math.ceil(parseInt(privateKey.algorithm.namedCurve.substr(-3), 10) / 8) <<
        3));
    return concatKdf(sharedSecret, keyLength, value);
};
export const ephemeralKeyToPublicJWK = async function ephemeralKeyToPublicJWK(key) {
    ensureSecureContext();
    const { crv, kty, x, y } = await crypto.subtle.exportKey('jwk', key);
    return { crv, kty, x, y };
};
export const generateEpk = async (key) => {
    ensureSecureContext();
    return (await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: key.algorithm.namedCurve }, true, ['deriveBits'])).privateKey;
};
export const publicJwkToEphemeralKey = async (jwk) => {
    ensureSecureContext();
    return crypto.subtle.importKey('jwk', jwk, { name: 'ECDH', namedCurve: jwk.crv }, true, []);
};
const curves = ['P-256', 'P-384', 'P-521'];
export const ecdhAllowed = (key) => curves.includes(key.algorithm.namedCurve);

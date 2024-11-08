import crypto, { ensureSecureContext } from './webcrypto.js';
const keyToJWK = async (key) => {
    if (!key.extractable) {
        throw new TypeError('non-extractable key cannot be extracted as a JWK');
    }
    ensureSecureContext();
    const { ext, key_ops, alg, use, ...jwk } = await crypto.subtle.exportKey('jwk', key);
    return jwk;
};
export default keyToJWK;

import { encode as base64url } from '../runtime/base64url.js';
import asJWK from '../runtime/key_to_jwk.js';
export default async function fromKeyLike(key) {
    if (key instanceof Uint8Array) {
        return {
            kty: 'oct',
            k: base64url(key),
        };
    }
    return asJWK(key);
}

import decrypt from '../flattened/decrypt.js';
import { JWEInvalid } from '../../util/errors.js';
import { decoder } from '../../lib/buffer_utils.js';
export default async function compactDecrypt(jwe, key, options) {
    if (jwe instanceof Uint8Array) {
        jwe = decoder.decode(jwe);
    }
    if (typeof jwe !== 'string') {
        throw new JWEInvalid('Compact JWE must be a string or Uint8Array');
    }
    const { 0: protectedHeader, 1: encryptedKey, 2: iv, 3: ciphertext, 4: tag, length } = jwe.split('.');
    if (length !== 5) {
        throw new JWEInvalid('Invalid Compact JWE');
    }
    const decrypted = await decrypt({
        ciphertext: (ciphertext || undefined),
        iv: (iv || undefined),
        protected: protectedHeader || undefined,
        tag: (tag || undefined),
        encrypted_key: encryptedKey || undefined,
    }, key, options);
    return { plaintext: decrypted.plaintext, protectedHeader: decrypted.protectedHeader };
}
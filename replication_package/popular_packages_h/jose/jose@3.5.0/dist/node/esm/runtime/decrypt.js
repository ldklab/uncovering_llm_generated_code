import { getCiphers, KeyObject, createDecipheriv } from 'crypto';
import checkIvLength from '../lib/check_iv_length.js';
import checkCekLength from './check_cek_length.js';
import { concat } from '../lib/buffer_utils.js';
import { JOSENotSupported, JWEDecryptionFailed } from '../util/errors.js';
import timingSafeEqual from './timing_safe_equal.js';
import cbcTag from './cbc_tag.js';
async function cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    if (cek instanceof KeyObject) {
        cek = cek.export();
    }
    const encKey = cek.subarray(keySize >> 3);
    const macKey = cek.subarray(0, keySize >> 3);
    const macSize = parseInt(enc.substr(-3), 10);
    const algorithm = `aes-${keySize}-cbc`;
    if (!getCiphers().includes(algorithm)) {
        throw new JOSENotSupported(`alg ${enc} is unsupported either by your javascript runtime`);
    }
    let plaintext;
    try {
        const cipher = createDecipheriv(algorithm, encKey, iv);
        plaintext = concat(cipher.update(ciphertext), cipher.final());
    }
    catch {
    }
    const expectedTag = cbcTag(aad, iv, ciphertext, macSize, macKey, keySize);
    let macCheckPassed;
    try {
        macCheckPassed = timingSafeEqual(tag, expectedTag);
    }
    catch {
    }
    if (!plaintext || !macCheckPassed) {
        throw new JWEDecryptionFailed();
    }
    return plaintext;
}
async function gcmDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    const algorithm = `aes-${keySize}-gcm`;
    if (!getCiphers().includes(algorithm)) {
        throw new JOSENotSupported(`alg ${enc} is unsupported either by your javascript runtime`);
    }
    try {
        const cipher = createDecipheriv(algorithm, cek, iv, { authTagLength: 16 });
        cipher.setAuthTag(tag);
        cipher.setAAD(aad);
        return concat(cipher.update(ciphertext), cipher.final());
    }
    catch (err) {
        throw new JWEDecryptionFailed();
    }
}
const decrypt = async (enc, cek, ciphertext, iv, tag, aad) => {
    checkCekLength(enc, cek);
    checkIvLength(enc, iv);
    if (enc.substr(4, 3) === 'CBC') {
        return cbcDecrypt(enc, cek, ciphertext, iv, tag, aad);
    }
    return gcmDecrypt(enc, cek, ciphertext, iv, tag, aad);
};
export default decrypt;

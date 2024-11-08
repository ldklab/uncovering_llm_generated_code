import { KeyObject, createCipheriv } from 'crypto';
import checkIvLength from '../lib/check_iv_length.js';
import checkCekLength from './check_cek_length.js';
import { concat } from '../lib/buffer_utils.js';
import cbcTag from './cbc_tag.js';
async function cbcEncrypt(enc, plaintext, cek, iv, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    if (cek instanceof KeyObject) {
        cek = cek.export();
    }
    const encKey = cek.subarray(keySize >> 3);
    const macKey = cek.subarray(0, keySize >> 3);
    const algorithm = `aes-${keySize}-cbc`;
    const cipher = createCipheriv(algorithm, encKey, iv);
    const ciphertext = concat(cipher.update(plaintext), cipher.final());
    const macSize = parseInt(enc.substr(-3), 10);
    const tag = cbcTag(aad, iv, ciphertext, macSize, macKey, keySize);
    return { ciphertext, tag };
}
async function gcmEncrypt(enc, plaintext, cek, iv, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    const algorithm = `aes-${keySize}-gcm`;
    const cipher = createCipheriv(algorithm, cek, iv, { authTagLength: 16 });
    cipher.setAAD(aad);
    const ciphertext = concat(cipher.update(plaintext), cipher.final());
    const tag = cipher.getAuthTag();
    return { ciphertext, tag };
}
const encrypt = async (enc, plaintext, cek, iv, aad) => {
    checkCekLength(enc, cek);
    checkIvLength(enc, iv);
    if (enc.substr(4, 3) === 'CBC') {
        return cbcEncrypt(enc, plaintext, cek, iv, aad);
    }
    return gcmEncrypt(enc, plaintext, cek, iv, aad);
};
export default encrypt;

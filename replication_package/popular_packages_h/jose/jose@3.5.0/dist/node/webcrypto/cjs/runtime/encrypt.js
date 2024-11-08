"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const buffer_utils_js_1 = require("../lib/buffer_utils.js");
const check_iv_length_js_1 = require("../lib/check_iv_length.js");
const check_cek_length_js_1 = require("./check_cek_length.js");
const webcrypto_js_1 = require("./webcrypto.js");
async function cbcEncrypt(enc, plaintext, cek, iv, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    const encKey = await webcrypto_js_1.default.subtle.importKey('raw', cek.subarray(keySize >> 3), 'AES-CBC', false, ['encrypt']);
    const macKey = await webcrypto_js_1.default.subtle.importKey('raw', cek.subarray(0, keySize >> 3), {
        hash: `SHA-${keySize << 1}`,
        name: 'HMAC',
    }, false, ['sign']);
    const ciphertext = new Uint8Array(await webcrypto_js_1.default.subtle.encrypt({
        iv,
        name: 'AES-CBC',
    }, encKey, plaintext));
    const macData = buffer_utils_js_1.concat(aad, iv, ciphertext, buffer_utils_js_1.uint64be(aad.length << 3));
    const tag = new Uint8Array((await webcrypto_js_1.default.subtle.sign('HMAC', macKey, macData)).slice(0, keySize >> 3));
    return { ciphertext, tag };
}
async function gcmEncrypt(plaintext, cek, iv, aad) {
    const encKey = cek instanceof Uint8Array
        ? await webcrypto_js_1.default.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt'])
        : cek;
    const encrypted = new Uint8Array(await webcrypto_js_1.default.subtle.encrypt({
        additionalData: aad,
        iv,
        name: 'AES-GCM',
        tagLength: 128,
    }, encKey, plaintext));
    const tag = encrypted.slice(-16);
    const ciphertext = encrypted.slice(0, -16);
    return { ciphertext, tag };
}
const encrypt = async (enc, plaintext, cek, iv, aad) => {
    webcrypto_js_1.ensureSecureContext();
    check_cek_length_js_1.default(enc, cek);
    check_iv_length_js_1.default(enc, iv);
    if (enc.substr(4, 3) === 'CBC') {
        return cbcEncrypt(enc, plaintext, cek, iv, aad);
    }
    return gcmEncrypt(plaintext, cek, iv, aad);
};
exports.default = encrypt;

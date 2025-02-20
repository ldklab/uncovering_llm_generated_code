"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const check_iv_length_js_1 = require("../lib/check_iv_length.js");
const check_cek_length_js_1 = require("./check_cek_length.js");
const buffer_utils_js_1 = require("../lib/buffer_utils.js");
const errors_js_1 = require("../util/errors.js");
const timing_safe_equal_js_1 = require("./timing_safe_equal.js");
const cbc_tag_js_1 = require("./cbc_tag.js");
async function cbcDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    if (cek instanceof crypto_1.KeyObject) {
        cek = cek.export();
    }
    const encKey = cek.subarray(keySize >> 3);
    const macKey = cek.subarray(0, keySize >> 3);
    const macSize = parseInt(enc.substr(-3), 10);
    const algorithm = `aes-${keySize}-cbc`;
    if (!crypto_1.getCiphers().includes(algorithm)) {
        throw new errors_js_1.JOSENotSupported(`alg ${enc} is unsupported either by your javascript runtime`);
    }
    let plaintext;
    try {
        const cipher = crypto_1.createDecipheriv(algorithm, encKey, iv);
        plaintext = buffer_utils_js_1.concat(cipher.update(ciphertext), cipher.final());
    }
    catch {
    }
    const expectedTag = cbc_tag_js_1.default(aad, iv, ciphertext, macSize, macKey, keySize);
    let macCheckPassed;
    try {
        macCheckPassed = timing_safe_equal_js_1.default(tag, expectedTag);
    }
    catch {
    }
    if (!plaintext || !macCheckPassed) {
        throw new errors_js_1.JWEDecryptionFailed();
    }
    return plaintext;
}
async function gcmDecrypt(enc, cek, ciphertext, iv, tag, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    const algorithm = `aes-${keySize}-gcm`;
    if (!crypto_1.getCiphers().includes(algorithm)) {
        throw new errors_js_1.JOSENotSupported(`alg ${enc} is unsupported either by your javascript runtime`);
    }
    try {
        const cipher = crypto_1.createDecipheriv(algorithm, cek, iv, { authTagLength: 16 });
        cipher.setAuthTag(tag);
        cipher.setAAD(aad);
        return buffer_utils_js_1.concat(cipher.update(ciphertext), cipher.final());
    }
    catch (err) {
        throw new errors_js_1.JWEDecryptionFailed();
    }
}
const decrypt = async (enc, cek, ciphertext, iv, tag, aad) => {
    check_cek_length_js_1.default(enc, cek);
    check_iv_length_js_1.default(enc, iv);
    if (enc.substr(4, 3) === 'CBC') {
        return cbcDecrypt(enc, cek, ciphertext, iv, tag, aad);
    }
    return gcmDecrypt(enc, cek, ciphertext, iv, tag, aad);
};
exports.default = decrypt;

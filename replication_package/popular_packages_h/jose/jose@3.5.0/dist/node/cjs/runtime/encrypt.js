"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = require("crypto");
const check_iv_length_js_1 = require("../lib/check_iv_length.js");
const check_cek_length_js_1 = require("./check_cek_length.js");
const buffer_utils_js_1 = require("../lib/buffer_utils.js");
const cbc_tag_js_1 = require("./cbc_tag.js");
async function cbcEncrypt(enc, plaintext, cek, iv, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    if (cek instanceof crypto_1.KeyObject) {
        cek = cek.export();
    }
    const encKey = cek.subarray(keySize >> 3);
    const macKey = cek.subarray(0, keySize >> 3);
    const algorithm = `aes-${keySize}-cbc`;
    const cipher = crypto_1.createCipheriv(algorithm, encKey, iv);
    const ciphertext = buffer_utils_js_1.concat(cipher.update(plaintext), cipher.final());
    const macSize = parseInt(enc.substr(-3), 10);
    const tag = cbc_tag_js_1.default(aad, iv, ciphertext, macSize, macKey, keySize);
    return { ciphertext, tag };
}
async function gcmEncrypt(enc, plaintext, cek, iv, aad) {
    const keySize = parseInt(enc.substr(1, 3), 10);
    const algorithm = `aes-${keySize}-gcm`;
    const cipher = crypto_1.createCipheriv(algorithm, cek, iv, { authTagLength: 16 });
    cipher.setAAD(aad);
    const ciphertext = buffer_utils_js_1.concat(cipher.update(plaintext), cipher.final());
    const tag = cipher.getAuthTag();
    return { ciphertext, tag };
}
const encrypt = async (enc, plaintext, cek, iv, aad) => {
    check_cek_length_js_1.default(enc, cek);
    check_iv_length_js_1.default(enc, iv);
    if (enc.substr(4, 3) === 'CBC') {
        return cbcEncrypt(enc, plaintext, cek, iv, aad);
    }
    return gcmEncrypt(enc, plaintext, cek, iv, aad);
};
exports.default = encrypt;

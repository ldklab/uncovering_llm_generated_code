import encrypt from './encrypt.js';
import decrypt from './decrypt.js';
import ivFactory from '../lib/iv.js';
import random from './random.js';
import { encode as base64url } from './base64url.js';
const generateIv = ivFactory(random);
export const wrap = async (alg, key, cek, iv) => {
    const jweAlgorithm = alg.substr(0, 7);
    iv || (iv = await generateIv(jweAlgorithm));
    const { ciphertext: encryptedKey, tag } = await encrypt(jweAlgorithm, cek, key, iv, new Uint8Array());
    return { encryptedKey, iv: base64url(iv), tag: base64url(tag) };
};
export const unwrap = async (alg, key, encryptedKey, iv, tag) => {
    const jweAlgorithm = alg.substr(0, 7);
    return decrypt(jweAlgorithm, key, encryptedKey, iv, tag, new Uint8Array());
};

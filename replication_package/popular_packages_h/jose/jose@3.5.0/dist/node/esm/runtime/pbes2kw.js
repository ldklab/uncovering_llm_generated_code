import { promisify } from 'util';
import { pbkdf2 as pbkdf2cb } from 'crypto';
import random from './random.js';
import { p2s as concatSalt } from '../lib/buffer_utils.js';
import { encode as base64url } from './base64url.js';
import { wrap, unwrap } from './aeskw.js';
import checkP2s from '../lib/check_p2s.js';
const pbkdf2 = promisify(pbkdf2cb);
export const encrypt = async (alg, key, cek, p2c = Math.floor(Math.random() * 2049) + 2048, p2s = random(new Uint8Array(16))) => {
    checkP2s(p2s);
    const salt = concatSalt(alg, p2s);
    const keylen = parseInt(alg.substr(13, 3), 10) >> 3;
    const password = key instanceof Uint8Array ? key : key.export();
    const derivedKey = await pbkdf2(password, salt, p2c, keylen, `sha${alg.substr(8, 3)}`);
    const encryptedKey = await wrap(alg.substr(-6), derivedKey, cek);
    return { encryptedKey, p2c, p2s: base64url(p2s) };
};
export const decrypt = async (alg, key, encryptedKey, p2c, p2s) => {
    checkP2s(p2s);
    const salt = concatSalt(alg, p2s);
    const keylen = parseInt(alg.substr(13, 3), 10) >> 3;
    const password = key instanceof Uint8Array ? key : key.export();
    const derivedKey = await pbkdf2(password, salt, p2c, keylen, `sha${alg.substr(8, 3)}`);
    return unwrap(alg.substr(-6), derivedKey, encryptedKey);
};

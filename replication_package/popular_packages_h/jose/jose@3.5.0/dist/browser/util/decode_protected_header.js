import { ok as assert } from 'assert';
import { decode as base64url } from './base64url.js';
import { decoder } from '../lib/buffer_utils.js';
import isObject from '../lib/is_object.js';
export default function decodeProtectedHeader(token) {
    let protectedB64u;
    if (typeof token === 'string') {
        const parts = token.split('.');
        if (parts.length === 3 || parts.length === 5) {
            ;
            [protectedB64u] = parts;
        }
    }
    else if (typeof token === 'object' && token) {
        if ('protected' in token) {
            protectedB64u = token.protected;
        }
        else {
            throw new TypeError('Token does not contain a Protected Header');
        }
    }
    try {
        assert(typeof protectedB64u === 'string' && protectedB64u);
        const result = JSON.parse(decoder.decode(base64url(protectedB64u)));
        assert(isObject(result));
        return result;
    }
    catch (err) {
        throw new TypeError('Invalid Token or Protected Header formatting');
    }
}

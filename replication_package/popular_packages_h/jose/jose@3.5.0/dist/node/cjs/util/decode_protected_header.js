"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("assert");
const base64url_js_1 = require("./base64url.js");
const buffer_utils_js_1 = require("../lib/buffer_utils.js");
const is_object_js_1 = require("../lib/is_object.js");
function decodeProtectedHeader(token) {
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
        assert_1.ok(typeof protectedB64u === 'string' && protectedB64u);
        const result = JSON.parse(buffer_utils_js_1.decoder.decode(base64url_js_1.decode(protectedB64u)));
        assert_1.ok(is_object_js_1.default(result));
        return result;
    }
    catch (err) {
        throw new TypeError('Invalid Token or Protected Header formatting');
    }
}
exports.default = decodeProtectedHeader;

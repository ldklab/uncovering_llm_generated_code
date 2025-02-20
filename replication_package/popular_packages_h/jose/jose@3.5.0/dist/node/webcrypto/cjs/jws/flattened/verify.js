"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_js_1 = require("../../util/errors.js");
const buffer_utils_js_1 = require("../../lib/buffer_utils.js");
const is_disjoint_js_1 = require("../../lib/is_disjoint.js");
const is_object_js_1 = require("../../lib/is_object.js");
const check_key_type_js_1 = require("../../lib/check_key_type.js");
const base64url_js_1 = require("../../runtime/base64url.js");
const verify_js_1 = require("../../runtime/verify.js");
const validate_crit_js_1 = require("../../lib/validate_crit.js");
const validate_algorithms_js_1 = require("../../lib/validate_algorithms.js");
const checkExtensions = validate_crit_js_1.default.bind(undefined, errors_js_1.JWSInvalid, new Map([['b64', true]]));
const checkAlgOption = validate_algorithms_js_1.default.bind(undefined, 'algorithms');
async function flattenedVerify(jws, key, options) {
    if (!is_object_js_1.default(jws)) {
        throw new errors_js_1.JWSInvalid('Flattened JWS must be an object');
    }
    if (jws.protected === undefined && jws.header === undefined) {
        throw new errors_js_1.JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
    }
    if (jws.protected !== undefined && typeof jws.protected !== 'string') {
        throw new errors_js_1.JWSInvalid('JWS Protected Header incorrect type');
    }
    if (jws.payload === undefined) {
        throw new errors_js_1.JWSInvalid('JWS Payload missing');
    }
    if (typeof jws.signature !== 'string') {
        throw new errors_js_1.JWSInvalid('JWS Signature missing or incorrect type');
    }
    if (jws.header !== undefined && !is_object_js_1.default(jws.header)) {
        throw new errors_js_1.JWSInvalid('JWS Unprotected Header incorrect type');
    }
    let parsedProt = {};
    if (jws.protected) {
        const protectedHeader = base64url_js_1.decode(jws.protected);
        parsedProt = JSON.parse(buffer_utils_js_1.decoder.decode(protectedHeader));
    }
    if (!is_disjoint_js_1.default(parsedProt, jws.header)) {
        throw new errors_js_1.JWSInvalid('JWS Protected and JWS Unprotected Header Parameter names must be disjoint');
    }
    const joseHeader = {
        ...parsedProt,
        ...jws.header,
    };
    const extensions = checkExtensions(options?.crit, parsedProt, joseHeader);
    let b64 = true;
    if (extensions.has('b64')) {
        b64 = parsedProt.b64;
        if (typeof b64 !== 'boolean') {
            throw new errors_js_1.JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
        }
    }
    const { alg } = joseHeader;
    if (typeof alg !== 'string' || !alg) {
        throw new errors_js_1.JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
    }
    const algorithms = options && checkAlgOption(options.algorithms);
    if (algorithms && !algorithms.has(alg)) {
        throw new errors_js_1.JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter not allowed');
    }
    if (b64) {
        if (typeof jws.payload !== 'string') {
            throw new errors_js_1.JWSInvalid('JWS Payload must be a string');
        }
    }
    else if (typeof jws.payload !== 'string' && !(jws.payload instanceof Uint8Array)) {
        throw new errors_js_1.JWSInvalid('JWS Payload must be a string or an Uint8Array instance');
    }
    if (typeof key === 'function') {
        key = await key(parsedProt, jws);
    }
    check_key_type_js_1.default(alg, key);
    const data = buffer_utils_js_1.concat(buffer_utils_js_1.encoder.encode(jws.protected || ''), buffer_utils_js_1.encoder.encode('.'), typeof jws.payload === 'string' ? buffer_utils_js_1.encoder.encode(jws.payload) : jws.payload);
    const signature = base64url_js_1.decode(jws.signature);
    const verified = await verify_js_1.default(alg, key, signature, data);
    if (!verified) {
        throw new errors_js_1.JWSSignatureVerificationFailed();
    }
    let payload;
    if (b64) {
        payload = base64url_js_1.decode(jws.payload);
    }
    else if (typeof jws.payload === 'string') {
        payload = buffer_utils_js_1.encoder.encode(jws.payload);
    }
    else {
        payload = jws.payload;
    }
    const result = { payload };
    if (jws.protected !== undefined) {
        result.protectedHeader = parsedProt;
    }
    if (jws.header !== undefined) {
        result.unprotectedHeader = jws.header;
    }
    return result;
}
exports.default = flattenedVerify;

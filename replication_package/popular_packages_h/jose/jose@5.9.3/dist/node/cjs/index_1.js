"use strict";

const { compactDecrypt } = require("./jwe/compact/decrypt.js");
const { flattenedDecrypt } = require("./jwe/flattened/decrypt.js");
const { generalDecrypt } = require("./jwe/general/decrypt.js");
const { GeneralEncrypt } = require("./jwe/general/encrypt.js");
const { compactVerify } = require("./jws/compact/verify.js");
const { flattenedVerify } = require("./jws/flattened/verify.js");
const { generalVerify } = require("./jws/general/verify.js");
const { jwtVerify } = require("./jwt/verify.js");
const { jwtDecrypt } = require("./jwt/decrypt.js");
const { CompactEncrypt } = require("./jwe/compact/encrypt.js");
const { FlattenedEncrypt } = require("./jwe/flattened/encrypt.js");
const { CompactSign } = require("./jws/compact/sign.js");
const { FlattenedSign } = require("./jws/flattened/sign.js");
const { GeneralSign } = require("./jws/general/sign.js");
const { SignJWT } = require("./jwt/sign.js");
const { EncryptJWT } = require("./jwt/encrypt.js");
const { calculateJwkThumbprint, calculateJwkThumbprintUri } = require("./jwk/thumbprint.js");
const { EmbeddedJWK } = require("./jwk/embedded.js");
const { createLocalJWKSet } = require("./jwks/local.js");
const { createRemoteJWKSet, jwksCache, experimental_jwksCache } = require("./jwks/remote.js");
const { UnsecuredJWT } = require("./jwt/unsecured.js");
const { exportPKCS8, exportSPKI, exportJWK } = require("./key/export.js");
const { importSPKI, importPKCS8, importX509, importJWK } = require("./key/import.js");
const { decodeProtectedHeader } = require("./util/decode_protected_header.js");
const { decodeJwt } = require("./util/decode_jwt.js");
const errors = require("./util/errors.js");
const { generateKeyPair } = require("./key/generate_key_pair.js");
const { generateSecret } = require("./key/generate_secret.js");
const base64url = require("./util/base64url.js");
const cryptoRuntime = require("./util/runtime.js").default;

module.exports = {
    compactDecrypt,
    flattenedDecrypt,
    generalDecrypt,
    GeneralEncrypt,
    compactVerify,
    flattenedVerify,
    generalVerify,
    jwtVerify,
    jwtDecrypt,
    CompactEncrypt,
    FlattenedEncrypt,
    CompactSign,
    FlattenedSign,
    GeneralSign,
    SignJWT,
    EncryptJWT,
    calculateJwkThumbprint,
    calculateJwkThumbprintUri,
    EmbeddedJWK,
    createLocalJWKSet,
    createRemoteJWKSet,
    jwksCache,
    experimental_jwksCache,
    UnsecuredJWT,
    exportPKCS8,
    exportSPKI,
    exportJWK,
    importSPKI,
    importPKCS8,
    importX509,
    importJWK,
    decodeProtectedHeader,
    decodeJwt,
    errors,
    generateKeyPair,
    generateSecret,
    base64url,
    cryptoRuntime
};

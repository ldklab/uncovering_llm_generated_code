"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

// JWE related exports
exports.compactDecrypt = require("./jwe/compact/decrypt.js").compactDecrypt;
exports.flattenedDecrypt = require("./jwe/flattened/decrypt.js").flattenedDecrypt;
exports.generalDecrypt = require("./jwe/general/decrypt.js").generalDecrypt;
exports.GeneralEncrypt = require("./jwe/general/encrypt.js").GeneralEncrypt;
exports.CompactEncrypt = require("./jwe/compact/encrypt.js").CompactEncrypt;
exports.FlattenedEncrypt = require("./jwe/flattened/encrypt.js").FlattenedEncrypt;

// JWS related exports
exports.compactVerify = require("./jws/compact/verify.js").compactVerify;
exports.flattenedVerify = require("./jws/flattened/verify.js").flattenedVerify;
exports.generalVerify = require("./jws/general/verify.js").generalVerify;
exports.CompactSign = require("./jws/compact/sign.js").CompactSign;
exports.FlattenedSign = require("./jws/flattened/sign.js").FlattenedSign;
exports.GeneralSign = require("./jws/general/sign.js").GeneralSign;

// JWT related exports
exports.jwtVerify = require("./jwt/verify.js").jwtVerify;
exports.jwtDecrypt = require("./jwt/decrypt.js").jwtDecrypt;
exports.SignJWT = require("./jwt/sign.js").SignJWT;
exports.EncryptJWT = require("./jwt/encrypt.js").EncryptJWT;
exports.UnsecuredJWT = require("./jwt/unsecured.js").UnsecuredJWT;

// JWK related exports
exports.calculateJwkThumbprint = require("./jwk/thumbprint.js").calculateJwkThumbprint;
exports.calculateJwkThumbprintUri = require("./jwk/thumbprint.js").calculateJwkThumbprintUri;
exports.EmbeddedJWK = require("./jwk/embedded.js").EmbeddedJWK;

// JWKS related exports
exports.jwksCache = require("./jwks/remote.js").jwksCache;
exports.experimental_jwksCache = require("./jwks/remote.js").experimental_jwksCache;
exports.createLocalJWKSet = require("./jwks/local.js").createLocalJWKSet;
exports.createRemoteJWKSet = require("./jwks/remote.js").createRemoteJWKSet;

// Key export/import related exports
exports.exportPKCS8 = require("./key/export.js").exportPKCS8;
exports.exportSPKI = require("./key/export.js").exportSPKI;
exports.exportJWK = require("./key/export.js").exportJWK;
exports.importSPKI = require("./key/import.js").importSPKI;
exports.importPKCS8 = require("./key/import.js").importPKCS8;
exports.importX509 = require("./key/import.js").importX509;
exports.importJWK = require("./key/import.js").importJWK;

// Utility exports
exports.decodeProtectedHeader = require("./util/decode_protected_header.js").decodeProtectedHeader;
exports.decodeJwt = require("./util/decode_jwt.js").decodeJwt;
exports.errors = require("./util/errors.js");
exports.base64url = require("./util/base64url.js");

// Key generation exports
exports.generateKeyPair = require("./key/generate_key_pair.js").generateKeyPair;
exports.generateSecret = require("./key/generate_secret.js").generateSecret;

// Runtime export
exports.cryptoRuntime = require("./util/runtime.js").default;

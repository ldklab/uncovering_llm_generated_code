"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const compactDecrypt = require("./jwe/compact/decrypt.js").compactDecrypt;
exports.compactDecrypt = compactDecrypt;

const flattenedDecrypt = require("./jwe/flattened/decrypt.js").flattenedDecrypt;
exports.flattenedDecrypt = flattenedDecrypt;

const generalDecrypt = require("./jwe/general/decrypt.js").generalDecrypt;
exports.generalDecrypt = generalDecrypt;

const GeneralEncrypt = require("./jwe/general/encrypt.js").GeneralEncrypt;
exports.GeneralEncrypt = GeneralEncrypt;

const compactVerify = require("./jws/compact/verify.js").compactVerify;
exports.compactVerify = compactVerify;

const flattenedVerify = require("./jws/flattened/verify.js").flattenedVerify;
exports.flattenedVerify = flattenedVerify;

const generalVerify = require("./jws/general/verify.js").generalVerify;
exports.generalVerify = generalVerify;

const jwtVerify = require("./jwt/verify.js").jwtVerify;
exports.jwtVerify = jwtVerify;

const jwtDecrypt = require("./jwt/decrypt.js").jwtDecrypt;
exports.jwtDecrypt = jwtDecrypt;

const CompactEncrypt = require("./jwe/compact/encrypt.js").CompactEncrypt;
exports.CompactEncrypt = CompactEncrypt;

const FlattenedEncrypt = require("./jwe/flattened/encrypt.js").FlattenedEncrypt;
exports.FlattenedEncrypt = FlattenedEncrypt;

const CompactSign = require("./jws/compact/sign.js").CompactSign;
exports.CompactSign = CompactSign;

const FlattenedSign = require("./jws/flattened/sign.js").FlattenedSign;
exports.FlattenedSign = FlattenedSign;

const GeneralSign = require("./jws/general/sign.js").GeneralSign;
exports.GeneralSign = GeneralSign;

const SignJWT = require("./jwt/sign.js").SignJWT;
exports.SignJWT = SignJWT;

const EncryptJWT = require("./jwt/encrypt.js").EncryptJWT;
exports.EncryptJWT = EncryptJWT;

const { calculateJwkThumbprint, calculateJwkThumbprintUri } = require("./jwk/thumbprint.js");
exports.calculateJwkThumbprint = calculateJwkThumbprint;
exports.calculateJwkThumbprintUri = calculateJwkThumbprintUri;

const EmbeddedJWK = require("./jwk/embedded.js").EmbeddedJWK;
exports.EmbeddedJWK = EmbeddedJWK;

const createLocalJWKSet = require("./jwks/local.js").createLocalJWKSet;
exports.createLocalJWKSet = createLocalJWKSet;

const { createRemoteJWKSet, jwksCache, experimental_jwksCache } = require("./jwks/remote.js");
exports.createRemoteJWKSet = createRemoteJWKSet;
exports.jwksCache = jwksCache;
exports.experimental_jwksCache = experimental_jwksCache;

const UnsecuredJWT = require("./jwt/unsecured.js").UnsecuredJWT;
exports.UnsecuredJWT = UnsecuredJWT;

const { exportPKCS8, exportSPKI, exportJWK } = require("./key/export.js");
exports.exportPKCS8 = exportPKCS8;
exports.exportSPKI = exportSPKI;
exports.exportJWK = exportJWK;

const { importSPKI, importPKCS8, importX509, importJWK } = require("./key/import.js");
exports.importSPKI = importSPKI;
exports.importPKCS8 = importPKCS8;
exports.importX509 = importX509;
exports.importJWK = importJWK;

const decodeProtectedHeader = require("./util/decode_protected_header.js").decodeProtectedHeader;
exports.decodeProtectedHeader = decodeProtectedHeader;

const decodeJwt = require("./util/decode_jwt.js").decodeJwt;
exports.decodeJwt = decodeJwt;

exports.errors = require("./util/errors.js");

const generateKeyPair = require("./key/generate_key_pair.js").generateKeyPair;
exports.generateKeyPair = generateKeyPair;

const generateSecret = require("./key/generate_secret.js").generateSecret;
exports.generateSecret = generateSecret;

exports.base64url = require("./util/base64url.js");

const cryptoRuntime = require("./util/runtime.js").default;
exports.cryptoRuntime = cryptoRuntime;

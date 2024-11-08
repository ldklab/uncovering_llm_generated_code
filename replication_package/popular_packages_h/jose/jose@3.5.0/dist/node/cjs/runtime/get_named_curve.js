"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCurve = exports.weakMap = void 0;
const crypto_1 = require("crypto");
const errors_js_1 = require("../util/errors.js");
const p256 = Buffer.from([42, 134, 72, 206, 61, 3, 1, 7]);
const p384 = Buffer.from([43, 129, 4, 0, 34]);
const p521 = Buffer.from([43, 129, 4, 0, 35]);
const secp256k1 = Buffer.from([43, 129, 4, 0, 10]);
exports.weakMap = new WeakMap();
const getNamedCurve = (key) => {
    if (key.type === 'secret') {
        throw new TypeError('only "private" or "public" key objects can be used for this operation');
    }
    switch (key.asymmetricKeyType) {
        case 'ed25519':
        case 'ed448':
            return `Ed${key.asymmetricKeyType.substr(2)}`;
        case 'x25519':
        case 'x448':
            return `X${key.asymmetricKeyType.substr(1)}`;
        case 'ec': {
            if (exports.weakMap.has(key)) {
                return exports.weakMap.get(key);
            }
            if (key.type === 'private') {
                const curve = getNamedCurve(crypto_1.createPublicKey(key));
                exports.weakMap.set(key, curve);
                return curve;
            }
            const buf = key.export({ format: 'der', type: 'spki' });
            const i = buf[1] < 128 ? 14 : 15;
            const len = buf[i];
            const curveOid = buf.slice(i + 1, i + 1 + len);
            let curve;
            if (curveOid.equals(p256)) {
                curve = 'P-256';
            }
            else if (curveOid.equals(p384)) {
                curve = 'P-384';
            }
            else if (curveOid.equals(p521)) {
                curve = 'P-521';
            }
            else if (curveOid.equals(secp256k1)) {
                curve = 'secp256k1';
            }
            else {
                throw new errors_js_1.JOSENotSupported('unsupported curve for this operation');
            }
            exports.weakMap.set(key, curve);
            return curve;
        }
        default:
            throw new TypeError('invalid key asymmetric key type for this operation');
    }
};
function setCurve(keyObject, curve) {
    exports.weakMap.set(keyObject, curve);
}
exports.setCurve = setCurve;
exports.default = getNamedCurve;

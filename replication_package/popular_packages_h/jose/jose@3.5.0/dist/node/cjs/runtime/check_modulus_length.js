"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setModulusLength = exports.weakMap = void 0;
exports.weakMap = new WeakMap();
const getLength = (buf, index) => {
    let len = buf.readUInt8(1);
    if ((len & 0x80) === 0) {
        if (index === 0) {
            return len;
        }
        return getLength(buf.subarray(2 + len), index - 1);
    }
    const num = len & 0x7f;
    len = 0;
    for (let i = 0; i < num; i++) {
        len <<= 8;
        const j = buf.readUInt8(2 + i);
        len |= j;
    }
    if (index === 0) {
        return len;
    }
    return getLength(buf.subarray(2 + len), index - 1);
};
const getLengthOfSeqIndex = (sequence, index) => {
    const len = sequence.readUInt8(1);
    if ((len & 0x80) === 0) {
        return getLength(sequence.subarray(2), index);
    }
    const num = len & 0x7f;
    return getLength(sequence.subarray(2 + num), index);
};
const getModulusLength = (key) => {
    if (exports.weakMap.has(key)) {
        return exports.weakMap.get(key);
    }
    const modulusLength = (getLengthOfSeqIndex(key.export({ format: 'der', type: 'pkcs1' }), key.type === 'private' ? 1 : 0) -
        1) <<
        3;
    exports.weakMap.set(key, modulusLength);
    return modulusLength;
};
exports.setModulusLength = (keyObject, modulusLength) => {
    exports.weakMap.set(keyObject, modulusLength);
};
exports.default = (key, alg) => {
    if (getModulusLength(key) < 2048) {
        throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
};

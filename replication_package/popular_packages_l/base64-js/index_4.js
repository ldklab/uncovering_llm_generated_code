const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function byteLength(base64) {
    const len = base64.length;
    if (len % 4 !== 0) throw new Error('Invalid string. Length must be a multiple of 4');
    
    const validLen = base64.indexOf('=') === -1 ? len : base64.indexOf('=');
    const placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen;
}

function toByteArray(base64) {
    const validLen = base64.indexOf('=') === -1 ? base64.length : base64.indexOf('=');
    const placeHoldersLen = validLen === base64.length ? 0 : 4 - (validLen % 4);
    const byteArray = new Uint8Array((validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen);

    let curByte = 0;
    const len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    
    for (let i = 0; i < len; i += 4) {
        const tmp = (decode(base64.charAt(i)) << 18) |
                    (decode(base64.charAt(i + 1)) << 12) |
                    (decode(base64.charAt(i + 2)) << 6) |
                    decode(base64.charAt(i + 3));
        byteArray[curByte++] = (tmp >> 16) & 0xFF;
        byteArray[curByte++] = (tmp >> 8) & 0xFF;
        byteArray[curByte++] = tmp & 0xFF;
    }

    handlePlaceholders(base64, len, placeHoldersLen, byteArray, curByte);
    return byteArray;
}

function handlePlaceholders(base64, len, placeHoldersLen, byteArray, curByte) {
    if (placeHoldersLen === 2) {
        const tmp = (decode(base64.charAt(len)) << 2) | (decode(base64.charAt(len + 1)) >> 4);
        byteArray[curByte++] = tmp & 0xFF;
    } else if (placeHoldersLen === 1) {
        const tmp = (decode(base64.charAt(len)) << 10) |
                    (decode(base64.charAt(len + 1)) << 4) |
                    (decode(base64.charAt(len + 2)) >> 2);
        byteArray[curByte++] = (tmp >> 8) & 0xFF;
        byteArray[curByte++] = tmp & 0xFF;
    }
}

function fromByteArray(uint8Array) {
    const extraBytes = uint8Array.length % 3;
    let base64 = '';
    let temp;
   
    for (let i = 0; i < uint8Array.length - extraBytes; i += 3) {
        temp = ((uint8Array[i] << 16) & 0xFF0000) +
               ((uint8Array[i + 1] << 8) & 0xFF00) +
               (uint8Array[i + 2] & 0xFF);
        base64 += encode((temp >> 18) & 0x3F) +
                  encode((temp >> 12) & 0x3F) +
                  encode((temp >> 6) & 0x3F) +
                  encode(temp & 0x3F);
    }

    if (extraBytes === 1) {
        temp = uint8Array[uint8Array.length - 1];
        base64 += encode((temp >> 2) & 0x3F);
        base64 += encode((temp << 4) & 0x3F);
        base64 += '==';
    } else if (extraBytes === 2) {
        temp = (uint8Array[uint8Array.length - 2] << 8) + (uint8Array[uint8Array.length - 1]);
        base64 += encode((temp >> 10) & 0x3F);
        base64 += encode((temp >> 4) & 0x3F);
        base64 += encode((temp << 2) & 0x3F);
        base64 += '=';
    }

    return base64;
}

function decode(char) {
    return BASE64_CHARS.indexOf(char);
}

function encode(index) {
    return BASE64_CHARS.charAt(index);
}

module.exports = {
    byteLength,
    toByteArray,
    fromByteArray
};

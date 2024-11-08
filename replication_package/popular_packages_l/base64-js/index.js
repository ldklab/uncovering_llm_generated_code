const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function byteLength(base64) {
    let len = base64.length;
    if (len % 4 !== 0) {
        throw new Error('Invalid string. Length must be a multiple of 4');
    }
    let validLen = base64.indexOf('=') === -1 ? len : base64.indexOf('=');
    let placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);
    return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen;
}

function toByteArray(base64) {
    let validLen = base64.indexOf('=') === -1 ? base64.length : base64.indexOf('=');
    let placeHoldersLen = validLen === base64.length ? 0 : 4 - (validLen % 4);
    let arr = new Uint8Array((validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen);

    let curByte = 0;

    let len = placeHoldersLen > 0 ? validLen - 4 : validLen;
    for (let i = 0; i < len; i += 4) {
        let tmp = (decode(base64.charAt(i)) << 18) |
                  (decode(base64.charAt(i + 1)) << 12) |
                  (decode(base64.charAt(i + 2)) << 6) |
                  decode(base64.charAt(i + 3));
        arr[curByte++] = (tmp >> 16) & 0xFF;
        arr[curByte++] = (tmp >> 8) & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }

    if (placeHoldersLen === 2) {
        let tmp = (decode(base64.charAt(len)) << 2) | (decode(base64.charAt(len + 1)) >> 4);
        arr[curByte++] = tmp & 0xFF;
    } else if (placeHoldersLen === 1) {
        let tmp = (decode(base64.charAt(len)) << 10) |
                  (decode(base64.charAt(len + 1)) << 4) |
                  (decode(base64.charAt(len + 2)) >> 2);
        arr[curByte++] = (tmp >> 8) & 0xFF;
        arr[curByte++] = tmp & 0xFF;
    }

    return arr;
}

function fromByteArray(uint8) {
    let extraBytes = uint8.length % 3;
    let output = '';
    let temp;

    for (let i = 0; i < uint8.length - extraBytes; i += 3) {
        temp = ((uint8[i] << 16) & 0xFF0000) +
               ((uint8[i + 1] << 8) & 0xFF00) +
               (uint8[i + 2] & 0xFF);
        output += encode((temp >> 18) & 0x3F) +
                  encode((temp >> 12) & 0x3F) +
                  encode((temp >> 6) & 0x3F) +
                  encode(temp & 0x3F);
    }

    if (extraBytes === 1) {
        temp = uint8[uint8.length - 1];
        output += encode((temp >> 2) & 0x3F);
        output += encode((temp << 4) & 0x3F);
        output += '==';
    } else if (extraBytes === 2) {
        temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1]);
        output += encode((temp >> 10) & 0x3F);
        output += encode((temp >> 4) & 0x3F);
        output += encode((temp << 2) & 0x3F);
        output += '=';
    }

    return output;
}

function decode(char) {
    return chars.indexOf(char);
}

function encode(num) {
    return chars.charAt(num);
}

module.exports = {
    byteLength,
    toByteArray,
    fromByteArray
};

const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function calculateByteLength(b64String) {
    const length = b64String.length;
    if (length % 4 !== 0) {
        throw new Error('Invalid Base64 string. Length must be a multiple of 4.');
    }
    const validLength = b64String.indexOf('=') === -1 ? length : b64String.indexOf('=');
    const paddingLength = validLength === length ? 0 : 4 - (validLength % 4);
    return ((validLength + paddingLength) * 3 / 4) - paddingLength;
}

function base64ToByteArray(b64String) {
    const validLength = b64String.indexOf('=') === -1 ? b64String.length : b64String.indexOf('=');
    const paddingLength = validLength === b64String.length ? 0 : 4 - (validLength % 4);
    const byteArray = new Uint8Array((validLength + paddingLength) * 3 / 4 - paddingLength);

    let byteIndex = 0;
    const processLength = paddingLength > 0 ? validLength - 4 : validLength;

    for (let i = 0; i < processLength; i += 4) {
        const temp = (base64Decode(b64String.charAt(i)) << 18) |
                     (base64Decode(b64String.charAt(i + 1)) << 12) |
                     (base64Decode(b64String.charAt(i + 2)) << 6) |
                     base64Decode(b64String.charAt(i + 3));
        byteArray[byteIndex++] = (temp >> 16) & 0xFF;
        byteArray[byteIndex++] = (temp >> 8) & 0xFF;
        byteArray[byteIndex++] = temp & 0xFF;
    }

    if (paddingLength === 2) {
        const temp = (base64Decode(b64String.charAt(processLength)) << 2) |
                     (base64Decode(b64String.charAt(processLength + 1)) >> 4);
        byteArray[byteIndex++] = temp & 0xFF;
    } else if (paddingLength === 1) {
        const temp = (base64Decode(b64String.charAt(processLength)) << 10) |
                     (base64Decode(b64String.charAt(processLength + 1)) << 4) |
                     (base64Decode(b64String.charAt(processLength + 2)) >> 2);
        byteArray[byteIndex++] = (temp >> 8) & 0xFF;
        byteArray[byteIndex++] = temp & 0xFF;
    }

    return byteArray;
}

function byteArrayToBase64(uint8Array) {
    const remainder = uint8Array.length % 3;
    let base64String = '';
    let temp;

    for (let i = 0; i < uint8Array.length - remainder; i += 3) {
        temp = ((uint8Array[i] << 16) & 0xFF0000) |
               ((uint8Array[i + 1] << 8) & 0xFF00) |
               (uint8Array[i + 2] & 0xFF);
        base64String += base64Encode((temp >> 18) & 0x3F) +
                        base64Encode((temp >> 12) & 0x3F) +
                        base64Encode((temp >> 6) & 0x3F) +
                        base64Encode(temp & 0x3F);
    }

    if (remainder === 1) {
        temp = uint8Array[uint8Array.length - 1];
        base64String += base64Encode((temp >> 2) & 0x3F);
        base64String += base64Encode((temp << 4) & 0x3F);
        base64String += '==';
    } else if (remainder === 2) {
        temp = (uint8Array[uint8Array.length - 2] << 8) +
               (uint8Array[uint8Array.length - 1]);
        base64String += base64Encode((temp >> 10) & 0x3F);
        base64String += base64Encode((temp >> 4) & 0x3F);
        base64String += base64Encode((temp << 2) & 0x3F);
        base64String += '=';
    }

    return base64String;
}

function base64Decode(character) {
    return base64Chars.indexOf(character);
}

function base64Encode(index) {
    return base64Chars.charAt(index);
}

module.exports = {
    calculateByteLength,
    base64ToByteArray,
    byteArrayToBase64
};

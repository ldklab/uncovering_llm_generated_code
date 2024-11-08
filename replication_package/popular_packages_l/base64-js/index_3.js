const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function calculateByteLength(base64String) {
    let length = base64String.length;
    if (length % 4 !== 0) {
        throw new Error('Invalid string. Length must be a multiple of 4');
    }
    let actualLen = base64String.indexOf('=') === -1 ? length : base64String.indexOf('=');
    let placeholderLength = actualLen === length ? 0 : 4 - (actualLen % 4);
    return ((actualLen + placeholderLength) * 3 / 4) - placeholderLength;
}

function base64ToByteArray(base64String) {
    let actualLen = base64String.indexOf('=') === -1 ? base64String.length : base64String.indexOf('=');
    let placeholderLength = actualLen === base64String.length ? 0 : 4 - (actualLen % 4);
    let byteArray = new Uint8Array((actualLen + placeholderLength) * 3 / 4 - placeholderLength);

    let curByteIndex = 0;
    let endIndex = placeholderLength > 0 ? actualLen - 4 : actualLen;
    for (let i = 0; i < endIndex; i += 4) {
        let tempNum = (base64Decode(base64String.charAt(i)) << 18) |
                      (base64Decode(base64String.charAt(i + 1)) << 12) |
                      (base64Decode(base64String.charAt(i + 2)) << 6) |
                      base64Decode(base64String.charAt(i + 3));
        byteArray[curByteIndex++] = (tempNum >> 16) & 0xFF;
        byteArray[curByteIndex++] = (tempNum >> 8) & 0xFF;
        byteArray[curByteIndex++] = tempNum & 0xFF;
    }

    if (placeholderLength === 2) {
        let tempNum = (base64Decode(base64String.charAt(endIndex)) << 2) |
                      (base64Decode(base64String.charAt(endIndex + 1)) >> 4);
        byteArray[curByteIndex++] = tempNum & 0xFF;
    } else if (placeholderLength === 1) {
        let tempNum = (base64Decode(base64String.charAt(endIndex)) << 10) |
                      (base64Decode(base64String.charAt(endIndex + 1)) << 4) |
                      (base64Decode(base64String.charAt(endIndex + 2)) >> 2);
        byteArray[curByteIndex++] = (tempNum >> 8) & 0xFF;
        byteArray[curByteIndex++] = tempNum & 0xFF;
    }

    return byteArray;
}

function byteArrayToBase64(byteArray) {
    let leftoverBytes = byteArray.length % 3;
    let base64String = '';
    let num;

    for (let i = 0; i < byteArray.length - leftoverBytes; i += 3) {
        num = ((byteArray[i] << 16) & 0xFF0000) +
              ((byteArray[i + 1] << 8) & 0xFF00) +
              (byteArray[i + 2] & 0xFF);
        base64String += base64Encode((num >> 18) & 0x3F) +
                        base64Encode((num >> 12) & 0x3F) +
                        base64Encode((num >> 6) & 0x3F) +
                        base64Encode(num & 0x3F);
    }

    if (leftoverBytes === 1) {
        num = byteArray[byteArray.length - 1];
        base64String += base64Encode((num >> 2) & 0x3F);
        base64String += base64Encode((num << 4) & 0x3F);
        base64String += '==';
    } else if (leftoverBytes === 2) {
        num = (byteArray[byteArray.length - 2] << 8) + byteArray[byteArray.length - 1];
        base64String += base64Encode((num >> 10) & 0x3F);
        base64String += base64Encode((num >> 4) & 0x3F);
        base64String += base64Encode((num << 2) & 0x3F);
        base64String += '=';
    }

    return base64String;
}

function base64Decode(character) {
    return base64Chars.indexOf(character);
}

function base64Encode(num) {
    return base64Chars.charAt(num);
}

module.exports = {
    calculateByteLength,
    base64ToByteArray,
    byteArrayToBase64
};

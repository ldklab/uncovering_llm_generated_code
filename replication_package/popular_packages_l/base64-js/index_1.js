const CHAR_SET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function calculateByteLength(base64String) {
    const length = base64String.length;
    if (length % 4 !== 0) {
        throw new Error('Invalid string. Length must be a multiple of 4');
    }
    const equalsIndex = base64String.indexOf('=');
    const validLength = equalsIndex === -1 ? length : equalsIndex;
    const placeholders = validLength === length ? 0 : 4 - (validLength % 4);
    return ((validLength + placeholders) * 3 / 4) - placeholders;
}

function convertToByteArray(base64String) {
    const validLength = base64String.indexOf('=') === -1 ? base64String.length : base64String.indexOf('=');
    const placeholders = validLength === base64String.length ? 0 : 4 - (validLength % 4);
    const byteArray = new Uint8Array((validLength + placeholders) * 3 / 4 - placeholders);
    let byteIndex = 0;
    const loopLength = placeholders > 0 ? validLength - 4 : validLength;

    for (let i = 0; i < loopLength; i += 4) {
        const combined = (decodeChar(base64String.charAt(i)) << 18) |
                         (decodeChar(base64String.charAt(i + 1)) << 12) |
                         (decodeChar(base64String.charAt(i + 2)) << 6) |
                         decodeChar(base64String.charAt(i + 3));

        byteArray[byteIndex++] = (combined >> 16) & 0xFF;
        byteArray[byteIndex++] = (combined >> 8) & 0xFF;
        byteArray[byteIndex++] = combined & 0xFF;
    }

    if (placeholders === 2) {
        const combined = (decodeChar(base64String.charAt(loopLength)) << 2) |
                         (decodeChar(base64String.charAt(loopLength + 1)) >> 4);
        byteArray[byteIndex++] = combined & 0xFF;
    } else if (placeholders === 1) {
        const combined = (decodeChar(base64String.charAt(loopLength)) << 10) |
                         (decodeChar(base64String.charAt(loopLength + 1)) << 4) |
                         (decodeChar(base64String.charAt(loopLength + 2)) >> 2);
        byteArray[byteIndex++] = (combined >> 8) & 0xFF;
        byteArray[byteIndex++] = combined & 0xFF;
    }

    return byteArray;
}

function convertFromByteArray(uint8Array) {
    let extraBytes = uint8Array.length % 3;
    let base64Output = '';
    let tempValue;

    for (let i = 0; i < uint8Array.length - extraBytes; i += 3) {
        tempValue = ((uint8Array[i] << 16) & 0xFF0000) +
                    ((uint8Array[i + 1] << 8) & 0xFF00) +
                    (uint8Array[i + 2] & 0xFF);
        base64Output += encodeChar((tempValue >> 18) & 0x3F) +
                        encodeChar((tempValue >> 12) & 0x3F) +
                        encodeChar((tempValue >> 6) & 0x3F) +
                        encodeChar(tempValue & 0x3F);
    }

    if (extraBytes === 1) {
        tempValue = uint8Array[uint8Array.length - 1];
        base64Output += encodeChar((tempValue >> 2) & 0x3F);
        base64Output += encodeChar((tempValue << 4) & 0x3F);
        base64Output += '==';
    } else if (extraBytes === 2) {
        tempValue = (uint8Array[uint8Array.length - 2] << 8) + (uint8Array[uint8Array.length - 1]);
        base64Output += encodeChar((tempValue >> 10) & 0x3F);
        base64Output += encodeChar((tempValue >> 4) & 0x3F);
        base64Output += encodeChar((tempValue << 2) & 0x3F);
        base64Output += '=';
    }

    return base64Output;
}

function decodeChar(character) {
    return CHAR_SET.indexOf(character);
}

function encodeChar(index) {
    return CHAR_SET.charAt(index);
}

module.exports = {
    calculateByteLength,
    convertToByteArray,
    convertFromByteArray
};

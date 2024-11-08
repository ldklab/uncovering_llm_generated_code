function toStringValue(mixedValue) {
    let key, concatenatedString = '';

    if (typeof mixedValue === 'string' || typeof mixedValue === 'number') {
        return String(mixedValue);
    } else if (typeof mixedValue === 'object') {
        if (Array.isArray(mixedValue)) {
            for (key = 0; key < mixedValue.length; key++) {
                if (mixedValue[key]) {
                    const result = toStringValue(mixedValue[key]);
                    if (result) {
                        if (concatenatedString) concatenatedString += ' ';
                        concatenatedString += result;
                    }
                }
            }
        } else {
            for (key in mixedValue) {
                if (mixedValue[key]) {
                    if (concatenatedString) concatenatedString += ' ';
                    concatenatedString += key;
                }
            }
        }
    }

    return concatenatedString;
}

module.exports = function combineArgumentsToString() {
    let index = 0, tempValue, resultString = '';

    while (index < arguments.length) {
        tempValue = arguments[index++];
        if (tempValue) {
            const valueString = toStringValue(tempValue);
            if (valueString) {
                if (resultString) resultString += ' ';
                resultString += valueString;
            }
        }
    }

    return resultString;
}

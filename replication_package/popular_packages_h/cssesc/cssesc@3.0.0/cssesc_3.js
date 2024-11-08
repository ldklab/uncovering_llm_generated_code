/*! https://mths.be/cssesc v3.0.0 by @mathias */
'use strict';

const mergeOptions = (givenOptions, defaultOptions) => {
    if (!givenOptions) {
        return defaultOptions;
    }
    const merged = {};
    for (const key in defaultOptions) {
        merged[key] = givenOptions.hasOwnProperty(key) ? givenOptions[key] : defaultOptions[key];
    }
    return merged;
};

const escapeRegex = {
    anySingleEscape: /[ -,\.\/:-@\[-\^`\{-~]/,
    singleEscape: /[ -,\.\/:-@\[\]\^`\{-~]/,
    alwaysEscape: /['"\\]/,
    excessiveSpaces: /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g
};

const cssesc = (inputString, userOptions) => {
    const options = mergeOptions(userOptions, cssesc.defaultOptions);
    const quoteType = options.quotes === 'double' ? '"' : '\'';
    const shouldEscapeIdentifier = options.isIdentifier;

    let result = '';
    for (let i = 0, length = inputString.length; i < length; i++) {
        let char = inputString.charAt(i);
        let codePoint = char.charCodeAt();
        let escapeSequence = '';

        if (codePoint < 0x20 || codePoint > 0x7E) {
            if (codePoint >= 0xD800 && codePoint <= 0xDBFF && i < length - 1) {
                const nextCodePoint = inputString.charCodeAt(i + 1);
                if ((nextCodePoint & 0xFC00) === 0xDC00) {
                    codePoint = ((codePoint & 0x3FF) << 10) + (nextCodePoint & 0x3FF) + 0x10000;
                    i++;
                }
            }
            escapeSequence = `\\${codePoint.toString(16).toUpperCase()} `;
        } else {
            if (options.escapeEverything) {
                if (escapeRegex.anySingleEscape.test(char)) {
                    escapeSequence = `\\${char}`;
                } else {
                    escapeSequence = `\\${codePoint.toString(16).toUpperCase()} `;
                }
            } else if (/[\t\n\f\r\x0B]/.test(char)) {
                escapeSequence = `\\${codePoint.toString(16).toUpperCase()} `;
            } else if (escapeRegex.alwaysEscape.test(char) ||
                (!shouldEscapeIdentifier && (char === quoteType || char === '\\')) ||
                (shouldEscapeIdentifier && escapeRegex.singleEscape.test(char))) {
                escapeSequence = `\\${char}`;
            } else {
                escapeSequence = char;
            }
        }
        result += escapeSequence;
    }

    if (shouldEscapeIdentifier) {
        if (/^-[-\d]/.test(result)) {
            result = `\\-${result.slice(1)}`;
        } else if (/\d/.test(inputString.charAt(0))) {
            result = `\\3${inputString.charAt(0)} ${result.slice(1)}`;
        }
    }

    result = result.replace(escapeRegex.excessiveSpaces, (match, leadingSlash, hexEscape) => {
        if (leadingSlash && leadingSlash.length % 2) {
            return match;
        }
        return (leadingSlash || '') + hexEscape;
    });

    return !shouldEscapeIdentifier && options.wrap ? `${quoteType}${result}${quoteType}` : result;
};

cssesc.defaultOptions = {
    escapeEverything: false,
    isIdentifier: false,
    quotes: 'single',
    wrap: false
};

cssesc.version = '3.0.0';

module.exports = cssesc;

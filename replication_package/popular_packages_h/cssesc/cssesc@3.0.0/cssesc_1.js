//! https://mths.be/cssesc v3.0.0 by @mathias
'use strict';

const baseObject = {};
const ownProperty = baseObject.hasOwnProperty;

const mergeOptions = (opts = {}, defaultOpts = {}) => {
    const merged = {};
    for (const key in defaultOpts) {
        merged[key] = ownProperty.call(opts, key) ? opts[key] : defaultOpts[key];
    }
    return merged;
};

const regexSingleEscapeChars = /[ -,\.\/:-@\[\]\^`\{-~]/;
const regexAnyEscapeChars = /[ -,\.\/:-@\[-\^`\{-~]/;
const alwaysEscape = /['"\\]/;
const excessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;

const cssesc = (inputString, opts) => {
    opts = mergeOptions(opts, cssesc.defaultOptions);
    if (opts.quotes !== 'single' && opts.quotes !== 'double') {
        opts.quotes = 'single';
    }
    const quoteSymbol = opts.quotes === 'double' ? '"' : '\'';
    let output = '';
    let idx = 0;
    const length = inputString.length;
    const beginChar = inputString.charAt(0);
    const isId = opts.isIdentifier;

    while (idx < length) {
        let char = inputString.charAt(idx++);
        let cp = char.charCodeAt();
        let escapeVal = '';

        if (cp < 0x20 || cp > 0x7E) {
            if (cp >= 0xD800 && cp <= 0xDBFF && idx < length) {
                let nextCharCode = inputString.charCodeAt(idx++);
                if ((nextCharCode & 0xFC00) === 0xDC00) {
                    cp = ((cp & 0x3FF) << 10) + (nextCharCode & 0x3FF) + 0x10000;
                } else {
                    idx--;
                }
            }
            escapeVal = '\\' + cp.toString(16).toUpperCase() + ' ';
        } else {
            if (opts.escapeEverything) {
                if (regexAnyEscapeChars.test(char)) {
                    escapeVal = '\\' + char;
                } else {
                    escapeVal = '\\' + cp.toString(16).toUpperCase() + ' ';
                }
            } else if (/[\t\n\f\r\x0B]/.test(char)) {
                escapeVal = '\\' + cp.toString(16).toUpperCase() + ' ';
            } else if (char === '\\' || (!isId && (char === quoteSymbol)) || (isId && regexSingleEscapeChars.test(char))) {
                escapeVal = '\\' + char;
            } else {
                escapeVal = char;
            }
        }
        output += escapeVal;
    }

    if (isId) {
        if (/^-[-\d]/.test(output)) {
            output = '\\-' + output.slice(1);
        } else if (/\d/.test(beginChar)) {
            output = '\\3' + beginChar + ' ' + output.slice(1);
        }
    }

    output = output.replace(excessiveSpaces, ($0, $1, $2) => {
        return ($1 && $1.length % 2) ? $0 : ($1 || '') + $2;
    });

    return !isId && opts.wrap ? quoteSymbol + output + quoteSymbol : output;
};

cssesc.defaultOptions = {
    'escapeEverything': false,
    'isIdentifier': false,
    'quotes': 'single',
    'wrap': false
};

cssesc.version = '3.0.0';

module.exports = cssesc;

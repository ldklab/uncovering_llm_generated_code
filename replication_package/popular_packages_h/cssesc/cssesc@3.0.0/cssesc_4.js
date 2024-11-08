'use strict';

const object = {};
const hasOwnProperty = Object.prototype.hasOwnProperty;

function mergeOptions(userOptions, defaultOptions) {
    if (!userOptions) {
        return defaultOptions;
    }
    const combined = {};
    for (const key in defaultOptions) {
        combined[key] = hasOwnProperty.call(userOptions, key) ? userOptions[key] : defaultOptions[key];
    }
    return combined;
}

const regexAnySingleEscape = /[ -,\.\/:-@\[-\^`\{-~]/;
const regexSingleEscape = /[ -,\.\/:-@\[\]\^`\{-~]/;
const regexAlwaysEscape = /['"\\]/;
const regexExcessiveSpaces = /(^|\\+)?(\\[A-F0-9]{1,6})\x20(?![a-fA-F0-9\x20])/g;

function cssesc(string, options = {}) {
    options = mergeOptions(options, cssesc.defaults);
    const quote = options.quotes === 'double' ? '"' : '\'';
    const isIdentifier = options.isIdentifier;

    let output = '';
    let counter = 0;
    const length = string.length;
    const firstChar = string.charAt(0);

    while (counter < length) {
        let character = string.charAt(counter++);
        let codePoint = character.charCodeAt();
        let value;

        if (codePoint < 0x20 || codePoint > 0x7E) {
            if (codePoint >= 0xD800 && codePoint <= 0xDBFF && counter < length) {
                const extra = string.charCodeAt(counter++);
                if ((extra & 0xFC00) === 0xDC00) {
                    codePoint = ((codePoint & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000;
                } else {
                    counter--;
                }
            }
            value = `\\${codePoint.toString(16).toUpperCase()} `;
        } else {
            if (options.escapeEverything) {
                value = regexAnySingleEscape.test(character)
                    ? `\\${character}` 
                    : `\\${codePoint.toString(16).toUpperCase()} `;
            } else if (/[\t\n\f\r\x0B]/.test(character)) {
                value = `\\${codePoint.toString(16).toUpperCase()} `;
            } else if (character === '\\' ||
                       (!isIdentifier && ((character === '"' && quote === character) || (character === '\'' && quote === character))) ||
                       (isIdentifier && regexSingleEscape.test(character))) {
                value = `\\${character}`;
            } else {
                value = character;
            }
        }
        output += value;
    }

    if (isIdentifier) {
        if (/^-[-\d]/.test(output)) {
            output = `\\-${output.slice(1)}`;
        } else if (/\d/.test(firstChar)) {
            output = `\\3${firstChar} ${output.slice(1)}`;
        }
    }

    output = output.replace(regexExcessiveSpaces, ($0, $1, $2) => {
        if ($1 && $1.length % 2) {
            return $0;
        }
        return ($1 || '') + $2;
    });

    if (!isIdentifier && options.wrap) {
        return `${quote}${output}${quote}`;
    }
    return output;
}

cssesc.defaults = {
    escapeEverything: false,
    isIdentifier: false,
    quotes: 'single',
    wrap: false
};

cssesc.version = '3.0.0';

module.exports = cssesc;

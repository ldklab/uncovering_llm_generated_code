'use strict';

// Utility functions
function forOwn(object, callback) {
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            callback(key, object[key]);
        }
    }
}

function extend(destination, source) {
    if (!source) return destination;
    forOwn(source, (key, value) => destination[key] = value);
    return destination;
}

function forEach(array, callback) {
    const length = array.length;
    let index = -1;
    while (++index < length) {
        callback(array[index]);
    }
}

function fourHexEscape(hex) {
    return '\\u' + ('0000' + hex).slice(-4);
}

function hexadecimal(code, lowercase) {
    const hex = code.toString(16);
    return lowercase ? hex : hex.toUpperCase();
}

// Type checks
function isArray(value) {
    return Array.isArray(value);
}

function isBuffer(value) {
    return typeof Buffer === 'function' && Buffer.isBuffer(value);
}

function isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
}

function isString(value) {
    return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
}

function isNumber(value) {
    return typeof value === 'number' || Object.prototype.toString.call(value) === '[object Number]';
}

function isFunction(value) {
    return typeof value === 'function';
}

function isMap(value) {
    return Object.prototype.toString.call(value) === '[object Map]';
}

function isSet(value) {
    return Object.prototype.toString.call(value) === '[object Set]';
}

// Escaping function
function jsesc(argument, options) {
    // Default options
    const defaults = {
        escapeEverything: false,
        minimal: false,
        isScriptContext: false,
        quotes: 'single',
        wrap: false,
        es6: false,
        json: false,
        compact: true,
        lowercaseHex: false,
        numbers: 'decimal',
        indent: '\t',
        indentLevel: 0
    };

    // Configure options
    options = extend(defaults, options);
    if (options.json) {
        options.quotes = 'double';
        options.wrap = true;
    }
    if (!['single', 'double', 'backtick'].includes(options.quotes)) {
        options.quotes = 'single';
    }

    // Prepare variables
    const quote = options.quotes === 'double' ? '"' : options.quotes === 'backtick' ? '`' : '\'';
    const compact = options.compact;
    const lowercaseHex = options.lowercaseHex;
    let indent = options.indent.repeat(options.indentLevel);
    let oldIndent;

    const inline1 = options.__inline1__;
    const inline2 = options.__inline2__;

    const newLine = compact ? '' : '\n';
    let result;
    let isEmpty = true;

    const useBinNumbers = options.numbers === 'binary';
    const useOctNumbers = options.numbers === 'octal';
    const useDecNumbers = options.numbers === 'decimal';
    const useHexNumbers = options.numbers === 'hexadecimal';

    // Handle different argument types
    if (options.json && argument && isFunction(argument.toJSON)) {
        argument = argument.toJSON();
    }

    if (!isString(argument)) {
        if (isMap(argument)) {
            if (argument.size === 0) return 'new Map()';
            if (!compact) {
                options.__inline1__ = true;
                options.__inline2__ = false;
            }
            return `new Map(${jsesc(Array.from(argument), options)})`;
        }

        if (isSet(argument)) {
            if (argument.size === 0) return 'new Set()';
            return `new Set(${jsesc(Array.from(argument), options)})`;
        }

        if (isBuffer(argument)) {
            if (argument.length === 0) return 'Buffer.from([])';
            return `Buffer.from(${jsesc(Array.from(argument), options)})`;
        }

        if (isArray(argument)) {
            result = [];
            options.wrap = true;
            if (inline1) {
                options.__inline1__ = false;
                options.__inline2__ = true;
            }
            if (!inline2) {
                oldIndent = indent;
                options.indentLevel++;
                indent = options.indent.repeat(options.indentLevel)
            }
            forEach(argument, (value) => {
                isEmpty = false;
                if (inline2) options.__inline2__ = false;
                result.push((compact || inline2 ? '' : indent) + jsesc(value, options));
            });
            return isEmpty ? '[]' :
                `[${newLine}${result.join(`,${newLine}`)}${newLine}${compact ? '' : oldIndent}]`;
        } else if (isNumber(argument)) {
            if (options.json) return JSON.stringify(argument);
            if (useDecNumbers) return String(argument);
            if (useHexNumbers) {
                let hex = argument.toString(16);
                if (!lowercaseHex) hex = hex.toUpperCase();
                return `0x${hex}`;
            }
            if (useBinNumbers) return `0b${argument.toString(2)}`;
            if (useOctNumbers) return `0o${argument.toString(8)}`;
        } else if (!isObject(argument)) {
            return options.json ? JSON.stringify(argument) || 'null' : String(argument);
        } else {
            result = [];
            options.wrap = true;
            oldIndent = indent;
            options.indentLevel++;
            indent = options.indent.repeat(options.indentLevel);
            forOwn(argument, (key, value) => {
                isEmpty = false;
                const keyEscaped = jsesc(key, options);
                const valueEscaped = jsesc(value, options);
                result.push(`${compact ? '' : indent}${keyEscaped}:${compact ? '' : ' '}${valueEscaped}`);
            });
            return isEmpty ? '{}' : `{${newLine}${result.join(`,${newLine}`)}${newLine}${compact ? '' : oldIndent}}`;
        }
    }

    const regex = options.escapeEverything ? escapeEverythingRegex : escapeNonAsciiRegex;
    result = argument.replace(regex, (char, pair, lone, quoteChar, index, string) => {
        if (pair) {
            if (options.minimal) return pair;
            const first = pair.charCodeAt(0);
            const second = pair.charCodeAt(1);
            if (options.es6) {
                const codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                return `\\u{${hexadecimal(codePoint, lowercaseHex)}}`;
            }
            return `${fourHexEscape(hexadecimal(first, lowercaseHex))}${fourHexEscape(hexadecimal(second, lowercaseHex))}`;
        }

        if (lone) {
            return fourHexEscape(hexadecimal(lone.charCodeAt(0), lowercaseHex));
        }

        if (char === '\0' && !options.json && !/[0-9]/.test(string.charAt(index + 1))) {
            return '\\0';
        }

        if (quoteChar) {
            return quoteChar === quote || options.escapeEverything ? `\\${quoteChar}` : quoteChar;
        }

        if (/[\\\b\f\n\r\t]/.test(char)) {
            return {
                '\\': '\\\\',
                '\b': '\\b',
                '\f': '\\f',
                '\n': '\\n',
                '\r': '\\r',
                '\t': '\\t'
            }[char];
        }

        if (options.minimal && !/[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/.test(char)) {
            return char;
        }

        const hex = hexadecimal(char.charCodeAt(0), lowercaseHex);
        return options.json || hex.length > 2 ? fourHexEscape(hex) : `\\x${('00' + hex).slice(-2)}`;
    });

    if (quote === '`') {
        result = result.replace(/\$\{/g, '\\${');
    }
    if (options.isScriptContext) {
        result = result
            .replace(/<\/(script|style)/gi, '<\\/$1')
            .replace(/<!--/g, options.json ? '\\u003C!--' : '\\x3C!--');
    }
    if (options.wrap) {
        result = `${quote}${result}${quote}`;
    }
    return result;
}

jsesc.version = '3.0.2';

module.exports = jsesc;

'use strict';

function forEach(array, callback) {
    for (let index = 0, length = array.length; index < length; index++) {
        callback(array[index]);
    }
}

function forOwn(object, callback) {
    for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            callback(key, object[key]);
        }
    }
}

function extend(destination, source) {
    if (!source) return destination;
    forOwn(source, (key, value) => {
        destination[key] = value;
    });
    return destination;
}

function fourHexEscape(hex) {
    return '\\u' + ('0000' + hex).slice(-4);
}

function hexadecimal(code, lowercase) {
    const hex = code.toString(16);
    return lowercase ? hex : hex.toUpperCase();
}

const singleEscapes = {
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t'
};
const regexSingleEscape = /[\\\b\f\n\r\t]/;
const regexDigit = /[0-9]/;
const regexWhitespace = /[\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/;
const escapeEverythingRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^]/g;
const escapeNonAsciiRegex = /([\uD800-\uDBFF][\uDC00-\uDFFF])|([\uD800-\uDFFF])|(['"`])|[^ !#-&\(-\[\]-_a-~]/g;

function isType(value, type) {
    return {}.toString.call(value) === `[object ${type}]`;
}

function isArray(value) {
    return Array.isArray(value);
}

function isObject(value) {
    return isType(value, 'Object');
}

function isString(value) {
    return typeof value === 'string' || isType(value, 'String');
}

function isNumber(value) {
    return typeof value === 'number' || isType(value, 'Number');
}

function isFunction(value) {
    return typeof value === 'function';
}

function isMap(value) {
    return isType(value, 'Map');
}

function isSet(value) {
    return isType(value, 'Set');
}

function isBuffer(value) {
    return typeof Buffer === 'function' && Buffer.isBuffer(value);
}

function jsesc(argument, options = {}) {
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
        indentLevel: 0,
        __inline1__: false,
        __inline2__: false
    };

    options = extend(defaults, options);
    const json = options.json;

    if (json) {
        options.quotes = 'double';
        options.wrap = true;
    }

    const quote = options.quotes === 'double' ? '"' : options.quotes === 'backtick' ? '`' : '\'';
    const regex = options.escapeEverything ? escapeEverythingRegex : escapeNonAsciiRegex;
    let indent = options.indent.repeat(options.indentLevel);
    let oldIndent = '';
    const compact = options.compact;
    const lowercaseHex = options.lowercaseHex;
    const inline1 = options.__inline1__;
    const inline2 = options.__inline2__;
    const newLine = compact ? '' : '\n';

    const increaseIndentation = () => {
        oldIndent = indent;
        ++options.indentLevel;
        indent = options.indent.repeat(options.indentLevel);
    };

    // Recursive serialization logic based on argument type
    const serialize = (arg) => {
        if (json && arg && isFunction(arg.toJSON)) {
            arg = arg.toJSON();
        }

        if (isString(arg)) {
            return arg.replace(regex, replaceSpecialChars);
        }

        if (isMap(arg)) {
            return handleMap(arg);
        }

        if (isSet(arg)) {
            return handleSet(arg);
        }

        if (isBuffer(arg)) {
            return handleBuffer(arg);
        }

        if (isArray(arg)) {
            return handleArray(arg);
        }

        if (isNumber(arg)) {
            return handleNumber(arg);
        }

        if (!isObject(arg)) {
            return json ? JSON.stringify(arg) || 'null' : String(arg);
        }

        return handleObject(arg);
    };

    const replaceSpecialChars = (char, pair, lone, quoteChar, index, string) => {
        if (pair) {
            if (options.minimal) return pair;
            const [first, second] = [pair.charCodeAt(0), pair.charCodeAt(1)];
            if (options.es6) {
                const codePoint = (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
                return `\\u{${hexadecimal(codePoint, lowercaseHex)}}`;
            }
            return (
                fourHexEscape(hexadecimal(first, lowercaseHex)) +
                fourHexEscape(hexadecimal(second, lowercaseHex))
            );
        }

        if (lone) {
            return fourHexEscape(hexadecimal(lone.charCodeAt(0), lowercaseHex));
        }

        if (char === '\0' && !json && !regexDigit.test(string.charAt(index + 1))) {
            return '\\0';
        }

        if (quoteChar) {
            return quoteChar === quote || options.escapeEverything ? `\\${quoteChar}` : quoteChar;
        }

        if (regexSingleEscape.test(char)) {
            return singleEscapes[char];
        }

        if (options.minimal && !regexWhitespace.test(char)) {
            return char;
        }

        const hex = hexadecimal(char.charCodeAt(0), lowercaseHex);
        return json || hex.length > 2 ? fourHexEscape(hex) : `\\x${('00' + hex).slice(-2)}`;
    };

    const handleMap = (map) => {
        if (map.size === 0) return 'new Map()';
        if (!compact) {
            options.__inline1__ = true;
            options.__inline2__ = false;
        }
        return `new Map(${serialize(Array.from(map))})`;
    };

    const handleSet = (set) => {
        if (set.size === 0) return 'new Set()';
        return `new Set(${serialize(Array.from(set))})`;
    };

    const handleBuffer = (buffer) => {
        if (buffer.length === 0) return 'Buffer.from([])';
        return `Buffer.from(${serialize(Array.from(buffer))})`;
    };

    const handleArray = (array) => {
        let result = [];
        options.wrap = true;
        if (inline1) {
            options.__inline1__ = false;
            options.__inline2__ = true;
        }
        if (!inline2) {
            increaseIndentation();
        }
        forEach(array, (value) => result.push((compact || inline2 ? '' : indent) + serialize(value)));
        return inline2 ? `[${result.join(', ')}]` : `[\n${result.join(',\n')}\n${compact ? '' : oldIndent}]`;
    };

    const handleNumber = (number) => {
        if (json) {
            return JSON.stringify(number);
        }
        if (options.numbers === 'decimal') {
            return String(number);
        }
        if (options.numbers === 'hexadecimal') {
            let hex = number.toString(16);
            if (!lowercaseHex) hex = hex.toUpperCase();
            return `0x${hex}`;
        }
        if (options.numbers === 'binary') {
            return `0b${number.toString(2)}`;
        }
        if (options.numbers === 'octal') {
            return `0o${number.toString(8)}`;
        }
    };

    const handleObject = (object) => {
        let result = [];
        options.wrap = true;
        increaseIndentation();
        forOwn(object, (key, value) => result.push(`${compact ? '' : indent}${serialize(key)}:${compact ? '' : ' '}${serialize(value)}`));
        return `{\n${result.join(',\n')}\n${compact ? '' : oldIndent}}`;
    };

    let result = serialize(argument);

    if (quote === '`') {
        result = result.replace(/\$\{/g, '\\${');
    }

    if (options.isScriptContext) {
        result = result.replace(/<\/(script|style)/gi, '<\\/$1').replace(/<!--/g, json ? '\\u003C!--' : '\\x3C!--');
    }

    if (options.wrap) {
        result = `${quote}${result}${quote}`;
    }

    return result;
}

jsesc.version = '3.0.2';

module.exports = jsesc;

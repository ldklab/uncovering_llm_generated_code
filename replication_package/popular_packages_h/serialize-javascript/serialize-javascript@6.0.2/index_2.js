'use strict';

const randomBytes = require('randombytes');

// Constants & Regex Definitions
const UID_LENGTH = 16;
const UID = generateUID();
const PLACEHOLDER_REGEX = new RegExp('(\\\\)?"@__(F|R|D|M|S|A|U|I|B|L)-' + UID + '-(\\d+)__@"', 'g');
const UNSAFE_CHARS_REGEX = /[<>\/\u2028\u2029]/g;
const IS_NATIVE_CODE_REGEX = /\{\s*\[native code\]\s*\}/g;
const IS_PURE_FUNCTION = /function.*?\(/;
const IS_ARROW_FUNCTION = /.*?=>.*?/;
const RESERVED_SYMBOLS = ['*', 'async'];
const ESCAPED_CHARS = {
    '<'     : '\\u003C',
    '>'     : '\\u003E',
    '/'     : '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};

// Utility Functions
function generateUID() {
    const bytes = randomBytes(UID_LENGTH);
    return Array.from(bytes, byte => byte.toString(16)).join('');
}

function escapeUnsafeChars(unsafeChar) {
    return ESCAPED_CHARS[unsafeChar] || unsafeChar;
}

function deleteFunctions(obj) {
    for (const key in obj) {
        if (typeof obj[key] === 'function') delete obj[key];
    }
}

// Main serialize function
module.exports = function serialize(obj, options = {}) {
    if (typeof options === 'number' || typeof options === 'string') {
        options = { space: options };
    }

    if (options.ignoreFunction && typeof obj === 'function') {
        return 'undefined';
    }

    const typeArrays = {
        functions: [],
        regexps: [],
        dates: [],
        maps: [],
        sets: [],
        arrays: [],
        undefs: [],
        infinities: [],
        bigInts: [],
        urls: []
    };

    // Replacer function to handle custom types
    const replacer = (key, value) => {
        if (options.ignoreFunction) deleteFunctions(value);

        if (!value && value !== undefined && value !== BigInt(0)) return value;

        const origValue = this[key];
        const valueType = typeof origValue;

        if (valueType === 'object') {
            return handleObject(origValue, typeArrays);
        }

        if (valueType === 'function') {
            return addToTypeArray('functions', origValue);
        }

        if (valueType === 'undefined') {
            return addToTypeArray('undefs', origValue);
        }

        if (valueType === 'number' && !isFinite(origValue)) {
            return addToTypeArray('infinities', origValue);
        }

        if (valueType === 'bigint') {
            return addToTypeArray('bigInts', origValue);
        }

        return value;
    };

    // Serializing the object
    const jsonString = JSON.stringify(obj, options.isJSON ? null : replacer, options.space);

    if (typeof jsonString !== 'string') return String(jsonString);

    let safeString = options.unsafe ? jsonString : jsonString.replace(UNSAFE_CHARS_REGEX, escapeUnsafeChars);

    if (Object.values(typeArrays).every(arr => arr.length === 0)) return safeString;

    // Replace placeholders in the JSON string with their proper representations
    return safeString.replace(PLACEHOLDER_REGEX, (match, backSlash, type, index) => {
        if (backSlash) return match;

        const handlers = {
            'D': () => `new Date("${typeArrays.dates[index].toISOString()}")`,
            'R': () => `new RegExp(${serialize(typeArrays.regexps[index].source)}, "${typeArrays.regexps[index].flags}")`,
            'M': () => `new Map(${serialize(Array.from(typeArrays.maps[index].entries()), options)})`,
            'S': () => `new Set(${serialize(Array.from(typeArrays.sets[index].values()), options)})`,
            'A': () => `Array.prototype.slice.call(${serialize(Object.assign({ length: typeArrays.arrays[index].length }, typeArrays.arrays[index]), options)})`,
            'U': () => 'undefined',
            'I': () => typeArrays.infinities[index],
            'B': () => `BigInt("${typeArrays.bigInts[index]}")`,
            'L': () => `new URL(${serialize(typeArrays.urls[index].toString(), options)})`,
            'F': () => serializeFunc(typeArrays.functions[index])
        };

        return handlers[type] ? handlers[type]() : match;
    });
};

// Helper Functions
function addToTypeArray(type, value, typeArrays) {
    return `@__${type.charAt(0).toUpperCase()}-${UID}-${typeArrays[type].push(value) - 1}__@`;
}

function handleObject(origValue, typeArrays) {
    if (origValue instanceof RegExp) return addToTypeArray('regexps', origValue, typeArrays);
    if (origValue instanceof Date) return addToTypeArray('dates', origValue, typeArrays);
    if (origValue instanceof Map) return addToTypeArray('maps', origValue, typeArrays);
    if (origValue instanceof Set) return addToTypeArray('sets', origValue, typeArrays);
    if (origValue instanceof Array) {
        const isSparse = origValue.filter(() => true).length !== origValue.length;
        if (isSparse) return addToTypeArray('arrays', origValue, typeArrays);
    }
    if (origValue instanceof URL) return addToTypeArray('urls', origValue, typeArrays);
    return undefined;
}

function serializeFunc(fn) {
    const fnString = fn.toString();
    if (IS_NATIVE_CODE_REGEX.test(fnString)) {
        throw new TypeError('Serializing native function: ' + fn.name);
    }

    if (IS_PURE_FUNCTION.test(fnString) || IS_ARROW_FUNCTION.test(fnString)) {
        return fnString;
    }

    const argsStart = fnString.indexOf('(');
    const parts = fnString.substr(0, argsStart).trim().split(' ').filter(Boolean);
    const nonReserved = parts.filter(p => !RESERVED_SYMBOLS.includes(p));
    if (nonReserved.length > 0) {
        return (parts.includes('async') ? 'async ' : '') + 'function' + (parts.join('').includes('*') ? '*' : '') + fnString.substr(argsStart);
    }

    return fnString;
}

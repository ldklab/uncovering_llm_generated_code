'use strict';

const randomBytes = require('randombytes');

const UID_LENGTH = 16;
const UID = generateUID();
const PLACE_HOLDER_REGEXP = new RegExp(`(\\\\)?"@__(F|R|D|M|S|A|U|I|B)-${UID}-(\\d+)__@"`, 'g');

const IS_NATIVE_CODE_REGEXP = /\{\s*\[native code\]\s*\}/g;
const IS_PURE_FUNCTION = /function.*?\(/;
const IS_ARROW_FUNCTION = /.*?=>.*?/;
const UNSAFE_CHARS_REGEXP = /[<>\/\u2028\u2029]/g;

const RESERVED_SYMBOLS = ['*', 'async'];

const ESCAPED_CHARS = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};

function escapeUnsafeChars(unsafeChar) {
    return ESCAPED_CHARS[unsafeChar];
}

function generateUID() {
    return Array.from(randomBytes(UID_LENGTH))
        .map(b => b.toString(16))
        .join('');
}

function deleteFunctions(obj) {
    Object.keys(obj)
        .filter(key => typeof obj[key] === "function")
        .forEach(key => delete obj[key]);
}

module.exports = function serialize(obj, options = {}) {
    if (typeof options === 'number' || typeof options === 'string') {
        options = { space: options };
    }

    const functions = [], regexps = [], dates = [], maps = [], sets = [],
        arrays = [], undefs = [], infinities = [], bigInts = [];

    function replacer(key, value) {
        if (options.ignoreFunction) {
            deleteFunctions(value);
        }

        if (!value && value !== undefined) return value;

        const origValue = this[key];
        const type = typeof origValue;

        if (type === 'object') {
            if (origValue instanceof RegExp) return serializePlaceholder('R', regexps, origValue);
            if (origValue instanceof Date) return serializePlaceholder('D', dates, origValue);
            if (origValue instanceof Map) return serializePlaceholder('M', maps, origValue);
            if (origValue instanceof Set) return serializePlaceholder('S', sets, origValue);
            if (Array.isArray(origValue) && isSparseArray(origValue)) 
                return serializePlaceholder('A', arrays, origValue);
        }

        if (type === 'function') return serializePlaceholder('F', functions, origValue);
        if (type === 'undefined') return serializePlaceholder('U', undefs, origValue);
        if (type === 'number' && !isFinite(origValue)) 
            return serializePlaceholder('I', infinities, origValue);
        if (type === 'bigint') return serializePlaceholder('B', bigInts, origValue);

        return value;
    }

    function serializePlaceholder(type, collection, value) {
        return `@__${type}-${UID}-${collection.push(value) - 1}__@`;
    }

    function serializeFunc(fn) {
        const serializedFn = fn.toString();
        if (IS_NATIVE_CODE_REGEXP.test(serializedFn)) {
            throw new TypeError(`Serializing native function: ${fn.name}`);
        }

        if (IS_PURE_FUNCTION.test(serializedFn) || IS_ARROW_FUNCTION.test(serializedFn)) {
            return serializedFn;
        }

        const argsIndex = serializedFn.indexOf('(');
        const parts = serializedFn.slice(0, argsIndex).trim().split(' ').filter(Boolean);
        const nonReserved = parts.filter(part => !RESERVED_SYMBOLS.includes(part));

        if (nonReserved.length > 0) {
            return `${parts.includes('async') ? 'async ' : ''}function${parts.includes('*') ? '*' : ''}${serializedFn.slice(argsIndex)}`;
        }

        return serializedFn;
    }

    function isSparseArray(arr) {
        return arr.filter(() => true).length !== arr.length;
    }

    if (options.ignoreFunction && typeof obj === "function") obj = undefined;
    if (obj === undefined) return String(obj);

    let str = JSON.stringify(obj, options.isJSON ? null : replacer, options.space);

    if (typeof str !== 'string') return String(str);

    if (!options.unsafe) str = str.replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);

    if ([functions, regexps, dates, maps, sets, arrays, undefs, infinities, bigInts].every(arr => arr.length === 0)) {
        return str;
    }

    return str.replace(PLACE_HOLDER_REGEXP, (match, backSlash, type, index) => {
        if (backSlash) return match;

        switch (type) {
            case 'D': return `new Date("${dates[index].toISOString()}")`;
            case 'R': return `new RegExp(${serialize(regexps[index].source)}, "${regexps[index].flags}")`;
            case 'M': return `new Map(${serialize(Array.from(maps[index]), options)})`;
            case 'S': return `new Set(${serialize(Array.from(sets[index]), options)})`;
            case 'A': return `Array.prototype.slice.call(${serialize(Object.assign({ length: arrays[index].length }, arrays[index]), options)})`;
            case 'U': return 'undefined';
            case 'I': return infinities[index];
            case 'B': return `BigInt("${bigInts[index]}")`;
            case 'F': return serializeFunc(functions[index]);
        }
    });
}

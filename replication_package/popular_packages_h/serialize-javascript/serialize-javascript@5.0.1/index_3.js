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
    const bytes = randomBytes(UID_LENGTH);
    return [...bytes].map(byte => byte.toString(16)).join('');
}

function deleteFunctions(obj){
    for (const key in obj) {
        if (typeof obj[key] === "function") {
            delete obj[key];
        }
    }
}

module.exports = function serialize(obj, options = {}) {
    if (typeof options === 'number' || typeof options === 'string') {
        options = { space: options };
    }

    const functions = [], regexps = [], dates = [], maps = [], sets = [], arrays = [], undefs = [], infinities = [], bigInts = [];

    function replacer(key, value) {
        if (options.ignoreFunction) {
            deleteFunctions(value);
        }

        if (!value && value !== undefined) {
            return value;
        }
        
        const origValue = this[key];
        const type = typeof origValue;

        if (type === 'object') {
            if (origValue instanceof RegExp)   return `@__R-${UID}-${regexps.push(origValue) - 1}__@`;
            if (origValue instanceof Date)     return `@__D-${UID}-${dates.push(origValue) - 1}__@`;
            if (origValue instanceof Map)      return `@__M-${UID}-${maps.push(origValue) - 1}__@`;
            if (origValue instanceof Set)      return `@__S-${UID}-${sets.push(origValue) - 1}__@`;
            if (origValue instanceof Array) {
                const isSparse = origValue.filter(() => true).length !== origValue.length;
                if (isSparse) return `@__A-${UID}-${arrays.push(origValue) - 1}__@`;
            }
        }

        if (type === 'function') return `@__F-${UID}-${functions.push(origValue) - 1}__@`;
        if (type === 'undefined') return `@__U-${UID}-${undefs.push(origValue) - 1}__@`;
        if (type === 'number' && !isNaN(origValue) && !isFinite(origValue)) {
            return `@__I-${UID}-${infinities.push(origValue) - 1}__@`;
        }
        if (type === 'bigint') return `@__B-${UID}-${bigInts.push(origValue) - 1}__@`;

        return value;
    }

    function serializeFunc(fn) {
        const serializedFn = fn.toString();
        if (IS_NATIVE_CODE_REGEXP.test(serializedFn)) {
            throw new TypeError(`Serializing native function: ${fn.name}`);
        }

        if (IS_PURE_FUNCTION.test(serializedFn) || IS_ARROW_FUNCTION.test(serializedFn)) {
            return serializedFn;
        }

        const argsStartsAt = serializedFn.indexOf('(');
        const def = serializedFn.substr(0, argsStartsAt).trim().split(' ').filter(val => val.length > 0);
        const nonReservedSymbols = def.filter(val => !RESERVED_SYMBOLS.includes(val));

        if (nonReservedSymbols.length > 0) {
            return (def.includes('async') ? 'async ' : '') + 'function' + (def.join('').includes('*') ? '*' : '') + serializedFn.substr(argsStartsAt);
        }

        return serializedFn;
    }

    if (options.ignoreFunction && typeof obj === "function") {
        obj = undefined;
    }

    if (obj === undefined) {
        return String(obj);
    }

    let str = options.isJSON && !options.space ? JSON.stringify(obj) : JSON.stringify(obj, options.isJSON ? null : replacer, options.space);

    if (typeof str !== 'string') {
        return String(str);
    }

    if (options.unsafe !== true) {
        str = str.replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);
    }

    if ([functions, regexps, dates, maps, sets, arrays, undefs, infinities, bigInts].every(arr => arr.length === 0)) {
        return str;
    }

    return str.replace(PLACE_HOLDER_REGEXP, function (match, backSlash, type, valueIndex) {
        if (backSlash) return match;

        switch (type) {
            case 'D': return `new Date("${dates[valueIndex].toISOString()}")`;
            case 'R': return `new RegExp(${serialize(regexps[valueIndex].source)}, "${regexps[valueIndex].flags}")`;
            case 'M': return `new Map(${serialize(Array.from(maps[valueIndex].entries()), options)})`;
            case 'S': return `new Set(${serialize(Array.from(sets[valueIndex].values()), options)})`;
            case 'A': return `Array.prototype.slice.call(${serialize(Object.assign({ length: arrays[valueIndex].length }, arrays[valueIndex]), options)})`;
            case 'U': return 'undefined';
            case 'I': return infinities[valueIndex];
            case 'B': return `BigInt("${bigInts[valueIndex]}")`;
            default: return serializeFunc(functions[valueIndex]);
        }
    });
}

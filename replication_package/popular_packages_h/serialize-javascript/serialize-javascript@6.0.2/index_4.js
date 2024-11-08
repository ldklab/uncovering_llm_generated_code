'use strict';

const randomBytes = require('randombytes');

// Constants and configurations
const UID_LENGTH = 16;
const UID = generateUID();
const PLACE_HOLDER_REGEXP = new RegExp(`(\\\\)?"@__(F|R|D|M|S|A|U|I|B|L)-${UID}-(\\d+)__@"`, 'g');
const IS_NATIVE_CODE_REGEXP = /\{\s*\[native code\]\s*\}/g;
const IS_FUNCTION = /function.*?\(|.*?=>.*?/;
const UNSAFE_CHARS_REGEXP = /[<>\/\u2028\u2029]/g;
const RESERVED_SYMBOLS = ['*', 'async'];
const ESCAPED_CHARS = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};

// Helper Functions
function escapeUnsafeChars(unsafeChar) {
    return ESCAPED_CHARS[unsafeChar];
}

function generateUID() {
    const bytes = randomBytes(UID_LENGTH);
    return Array.from(bytes).map(byte => byte.toString(16)).join('');
}

function deleteFunctions(obj) {
    Object.keys(obj).filter(key => typeof obj[key] === "function").forEach(key => delete obj[key]);
}

// Main Serialize Module
module.exports = function serialize(obj, options = {}) {
    const functions = [], regexps = [], dates = [], maps = [], sets = [],
        arrays = [], undefs = [], infinities = [], bigInts = [], urls = [];

    function replacer(key, value) {
        if (options.ignoreFunction) deleteFunctions(value);

        if (value === undefined || (typeof value === 'bigint' && value === BigInt(0))) return value;

        const origValue = this[key];
        const type = typeof origValue;

        if (type === 'object') {
            if (origValue instanceof RegExp) return addToCollection('@__R', regexps, origValue);
            if (origValue instanceof Date) return addToCollection('@__D', dates, origValue);
            if (origValue instanceof Map) return addToCollection('@__M', maps, origValue);
            if (origValue instanceof Set) return addToCollection('@__S', sets, origValue);
            if (origValue instanceof Array && origValue.filter(() => true).length !== origValue.length)
                return addToCollection('@__A', arrays, origValue);
            if (origValue instanceof URL) return addToCollection('@__L', urls, origValue);
        }

        if (type === 'function') return addToCollection('@__F', functions, origValue);
        if (type === 'undefined') return addToCollection('@__U', undefs, origValue);
        if (type === 'number' && !isFinite(origValue)) return addToCollection('@__I', infinities, origValue);
        if (type === 'bigint') return addToCollection('@__B', bigInts, origValue);

        return value;
    }

    function addToCollection(prefix, collection, value) {
        return `${prefix}-${UID}-${collection.push(value) - 1}__@`;
    }

    function serializeFunc(fn) {
        const serializedFn = fn.toString();
        if (IS_NATIVE_CODE_REGEXP.test(serializedFn)) throw new TypeError(`Serializing native function: ${fn.name}`);
        if (IS_FUNCTION.test(serializedFn)) return serializedFn;

        const argsStartsAt = serializedFn.indexOf('(');
        const def = serializedFn.slice(0, argsStartsAt).trim().split(/\s+/)
            .filter(val => RESERVED_SYMBOLS.indexOf(val) === -1);

        return (def.includes('async') ? 'async ' : '') + 'function' + (def.join('').includes('*') ? '*' : '') +
            serializedFn.slice(argsStartsAt);
    }

    if (options.ignoreFunction && typeof obj === "function") obj = undefined;
    const str = JSON.stringify(obj, !options.isJSON && replacer, options.space) || String(obj);

    if (options.unsafe !== true) str = str.replace(UNSAFE_CHARS_REGEXP, escapeUnsafeChars);

    return functions.concat(regexps, dates, maps, sets, arrays, undefs, infinities, bigInts, urls).length ?
        str.replace(PLACE_HOLDER_REGEXP, (match, backSlash, type, index) => backSlash ? match : resolvePlaceholder(type, index)) :
        str;
    
    function resolvePlaceholder(type, index) {
        const collections = { D: dates, R: regexps, M: maps, S: sets, A: arrays, U: undefs, I: infinities, B: bigInts, L: urls };
        const value = collections[type][index];
        const serializationMap = {
            D: `new Date("${value.toISOString()}")`,
            R: `new RegExp(${serialize(value.source)}, "${value.flags}")`,
            M: `new Map(${serialize([...value.entries()])})`,
            S: `new Set(${serialize([...value.values()])})`,
            A: `Array.prototype.slice.call(${serialize({ length: value.length, ...value })})`,
            U: 'undefined',
            I: value,
            B: `BigInt("${value}")`,
            L: `new URL(${serialize(value.toString())})`,
            F: serializeFunc,
        };
        return serializationMap[type](value);
    }
};

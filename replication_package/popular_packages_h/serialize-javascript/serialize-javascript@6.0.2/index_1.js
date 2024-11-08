const randomBytes = require('randombytes');

const UID_LENGTH = 16;
const UID = generateUID();
const PLACEHOLDER_REGEX = new RegExp(
    '(\\\\)?"@__(F|R|D|M|S|A|U|I|B|L)-' + UID + '-(\\d+)__@"', 'g'
);

const IS_NATIVE_CODE = /\{\s*\[native code\]\s*\}/g;
const IS_PURE_FUNCTION = /function.*?\(/;
const IS_ARROW_FUNCTION = /.*?=>.*?/;
const UNSAFE_CHARS = /[<>\/\u2028\u2029]/g;

const RESERVED_SYMBOLS = ['*', 'async'];
const ESCAPED_CHARS = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};

function escapeUnsafeChars(char) {
    return ESCAPED_CHARS[char];
}

function generateUID() {
    const bytes = randomBytes(UID_LENGTH);
    return Array.from(bytes).map(byte => byte.toString(16)).join('');
}

function deleteFunctions(obj) {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'function') {
            delete obj[key];
        }
    });
}

module.exports = function serialize(obj, options = {}) {
    if (typeof options === 'number' || typeof options === 'string') {
        options = { space: options };
    }

    const placeholders = {
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

    function replacer(key, value) {
        if (options.ignoreFunction) {
            deleteFunctions(value);
        }

        if (!value && value !== undefined && value !== BigInt(0)) {
            return value;
        }

        const origValue = this[key];
        const type = typeof origValue;

        if (type === 'object') {
            if (origValue instanceof RegExp) {
                return '@__R-' + UID + '-' + placeholders.regexps.push(origValue) - 1 + '__@';
            }
            if (origValue instanceof Date) {
                return '@__D-' + UID + '-' + placeholders.dates.push(origValue) - 1 + '__@';
            }
            if (origValue instanceof Map) {
                return '@__M-' + UID + '-' + placeholders.maps.push(origValue) - 1 + '__@';
            }
            if (origValue instanceof Set) {
                return '@__S-' + UID + '-' + placeholders.sets.push(origValue) - 1 + '__@';
            }
            if (origValue instanceof Array) {
                if (origValue.filter(() => true).length !== origValue.length) {
                    return '@__A-' + UID + '-' + placeholders.arrays.push(origValue) - 1 + '__@';
                }
            }
            if (origValue instanceof URL) {
                return '@__L-' + UID + '-' + placeholders.urls.push(origValue) - 1 + '__@';
            }
        }

        if (type === 'function') {
            return '@__F-' + UID + '-' + placeholders.functions.push(origValue) - 1 + '__@';
        }
        if (type === 'undefined') {
            return '@__U-' + UID + '-' + placeholders.undefs.push(origValue) - 1 + '__@';
        }
        if (type === 'number' && !Number.isNaN(origValue) && !Number.isFinite(origValue)) {
            return '@__I-' + UID + '-' + placeholders.infinities.push(origValue) - 1 + '__@';
        }
        if (type === 'bigint') {
            return '@__B-' + UID + '-' + placeholders.bigInts.push(origValue) - 1 + '__@';
        }

        return value;
    }

    function serializeFunction(fn) {
        const fnStr = fn.toString();
        if (IS_NATIVE_CODE.test(fnStr)) {
            throw new TypeError('Serializing native function: ' + fn.name);
        }
        if (IS_PURE_FUNCTION.test(fnStr) || IS_ARROW_FUNCTION.test(fnStr)) {
            return fnStr;
        }

        const argsStartsAt = fnStr.indexOf('(');
        const fnDef = fnStr.substr(0, argsStartsAt)
            .trim()
            .split(' ')
            .filter(val => val);

        const nonReservedSymbols = fnDef.filter(val => !RESERVED_SYMBOLS.includes(val));
        if (nonReservedSymbols.length > 0) {
            return (fnDef.includes('async') ? 'async ' : '') + 'function'
                + (fnDef.join('').includes('*') ? '*' : '')
                + fnStr.substr(argsStartsAt);
        }

        return fnStr;
    }

    if (options.ignoreFunction && typeof obj === 'function') {
        obj = undefined;
    }
    if (obj === undefined) {
        return String(obj);
    }

    let jsonString = JSON.stringify(obj, options.isJSON ? null : replacer, options.space);

    if (typeof jsonString !== 'string') {
        return String(jsonString);
    }

    if (options.unsafe !== true) {
        jsonString = jsonString.replace(UNSAFE_CHARS, escapeUnsafeChars);
    }

    if (Object.values(placeholders).every(arr => arr.length === 0)) {
        return jsonString;
    }

    return jsonString.replace(PLACEHOLDER_REGEX, (match, backSlash, type, index) => {
        if (backSlash) {
            return match;
        }

        switch (type) {
            case 'D':
                return `new Date("${placeholders.dates[index].toISOString()}")`;
            case 'R':
                return `new RegExp(${serialize(placeholders.regexps[index].source)}, "${placeholders.regexps[index].flags}")`;
            case 'M':
                return `new Map(${serialize(Array.from(placeholders.maps[index].entries()), options)})`;
            case 'S':
                return `new Set(${serialize(Array.from(placeholders.sets[index].values()), options)})`;
            case 'A':
                return `Array.prototype.slice.call(${serialize({ ...placeholders.arrays[index], length: placeholders.arrays[index].length }, options)})`;
            case 'U':
                return 'undefined';
            case 'I':
                return placeholders.infinities[index];
            case 'B':
                return `BigInt("${placeholders.bigInts[index]}")`;
            case 'L':
                return `new URL(${serialize(placeholders.urls[index].toString(), options)})`;
            case 'F':
                return serializeFunction(placeholders.functions[index]);
            default:
                return match;
        }
    });
};

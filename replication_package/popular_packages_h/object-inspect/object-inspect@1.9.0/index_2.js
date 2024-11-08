const { custom: inspectCustom } = require('./util.inspect');

const hasOwn = Object.prototype.hasOwnProperty;
const hasProperty = (obj, key) => hasOwn.call(obj, key);

const toString = Object.prototype.toString;
const functionToString = Function.prototype.toString;
const match = String.prototype.match;
const booleanValueOf = Boolean.prototype.valueOf;
const bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
const symbolToString = typeof Symbol === 'function' ? Symbol.prototype.toString : null;
const isEnumerable = Object.prototype.propertyIsEnumerable;

const objectTypes = {
    array: '[object Array]',
    date: '[object Date]',
    regexp: '[object RegExp]',
    error: '[object Error]',
    symbol: '[object Symbol]',
    string: '[object String]',
    number: '[object Number]',
    bigint: '[object BigInt]',
    boolean: '[object Boolean]',
};

function isOfType(obj, type) {
    return toString.call(obj) === type;
}

const inspect_ = module.exports = function inspect_(obj, options = {}, depth = 0, seen = []) {
    if ('quoteStyle' in options && !['single', 'double'].includes(options.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }

    if ('maxStringLength' in options) {
        const maxStringLength = options.maxStringLength;
        if (typeof maxStringLength !== 'number' || (maxStringLength < 0 && maxStringLength !== Infinity)) {
            throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
        }
    }

    if ('customInspect' in options && typeof options.customInspect !== 'boolean') {
        throw new TypeError('option "customInspect", if provided, must be `true` or `false`');
    }

    const customInspect = options.customInspect !== undefined ? options.customInspect : true;

    if ('indent' in options && ![null, '\t'].includes(options.indent) &&
        !(parseInt(options.indent, 10) === Number(options.indent) && options.indent > 0)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }

    if (obj === undefined) return 'undefined';
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj ? 'true' : 'false';

    if (typeof obj === 'string') return inspectString(obj, options);
    if (typeof obj === 'number') return obj === 0 ? (1 / obj > 0 ? '0' : '-0') : String(obj);
    if (typeof obj === 'bigint') return String(obj) + 'n';

    const maxDepth = ('depth' in options ? options.depth : 5);
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') return isOfType(obj, objectTypes.array) ? '[Array]' : '[Object]';

    const indent = getIndent(options, depth);

    if (seen.includes(obj)) return '[Circular]';
    seen = [...seen, obj];

    const inspect = (value, from, noIndent) => {
        const inspectOptions = noIndent ? { depth: options.depth, quoteStyle: options.quoteStyle } : options;
        return inspect_(value, inspectOptions, depth + 1, from ? seen.concat(from) : seen);
    };

    if (typeof obj === 'function') {
        const keys = getKeys(obj, inspect);
        return `[Function${nameOf(obj) ? `: ${nameOf(obj)}` : ' (anonymous)'}]${keys.length ? ` { ${keys.join(', ')} }` : ''}`;
    }
    
    if (isOfType(obj, objectTypes.symbol)) {
        return formatSymbol(obj);
    }

    if (isHTMLElement(obj)) {
        return formatHTMLElement(obj, options);
    }

    if (isOfType(obj, objectTypes.array)) {
        return formatArray(obj, inspect, indent);
    }

    if (isOfType(obj, objectTypes.error)) {
        const keys = getKeys(obj, inspect);
        return `{ [${obj}]${keys.length ? ` ${keys.join(', ')}` : ''} }`;
    }

    let customInspectResult;
    if (
        typeof obj === 'object' &&
        customInspect &&
        (inspectCustom || typeof obj.inspect === 'function')
    ) {
        customInspectResult = inspectCustom ? obj[inspectCustom]() : obj.inspect();
        if (customInspectResult !== 'object') return customInspectResult;
    }

    if (isMap(obj)) return formatMap(obj, inspect, indent);
    if (isSet(obj)) return formatSet(obj, inspect, indent);
    if (isWeakMap(obj)) return formatWeakMap(obj);
    if (isWeakSet(obj)) return formatWeakSet(obj);
    if (isOfType(obj, objectTypes.number)) return `[Number: ${inspect(Number(obj))}]`;
    if (isOfType(obj, objectTypes.bigint)) return `[BigInt: ${inspect(BigInt(obj))}]`;
    if (isOfType(obj, objectTypes.boolean)) return `[Boolean: ${booleanValueOf.call(obj)}]`;
    if (isOfType(obj, objectTypes.string)) return `[String: ${inspect(String(obj))}]`;

    const objKeys = getKeys(obj, inspect);
    return objKeys.length ? `{ ${objKeys.join(', ')} }` : '{}';
};

function wrapQuotes(s, defaultStyle, opts) {
    const quoteChar = (opts.quoteStyle || defaultStyle) === 'double' ? '"' : '\'';
    return quoteChar + s + quoteChar;
}

function quote(s) {
    return String(s).replace(/"/g, '&quot;');
}

function nameOf(fn) {
    if (fn.name) return fn.name;
    const match = functionToString.call(fn).match(/^function\s*([\w$]+)/);
    return match ? match[1] : null;
}

function inspectString(str, opts) {
    if (opts.maxStringLength && str.length > opts.maxStringLength) {
        const remaining = str.length - opts.maxStringLength;
        return `${inspectString(str.slice(0, opts.maxStringLength), opts)}... ${remaining} more characters`;
    }
    const escaped = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(escaped, 'single', opts);
}

function lowbyte(c) {
    const charCode = c.charCodeAt(0);
    const escapeChars = { 8: 'b', 9: 't', 10: 'n', 12: 'f', 13: 'r' };
    return escapeChars[charCode] ? `\\${escapeChars[charCode]}` : `\\x${charCode.toString(16).toUpperCase().padStart(2, '0')}`;
}

function formatSymbol(symbol) {
    const symbolStr = symbolToString.call(symbol);
    return typeof symbol === 'object' ? `Object(${symbolStr})` : symbolStr;
}

function isHTMLElement(obj) {
    return obj && typeof obj === 'object' && (obj.nodeType === 1 || typeof obj.nodeName === 'string') && typeof obj.getAttribute === 'function';
}

function formatHTMLElement(el, opts) {
    const tagName = String(el.nodeName).toLowerCase();
    let s = `<${tagName}`;
    const attrs = el.attributes || [];
    for (let i = 0; i < attrs.length; i++) {
        s += ` ${attrs[i].name}=${wrapQuotes(quote(attrs[i].value), 'double', opts)}`;
    }
    s += '>';
    if (el.childNodes && el.childNodes.length) s += '...';
    return `${s}</${tagName}>`;
}

function formatArray(arr, inspect, indent) {
    if (arr.length === 0) return '[]';
    const elements = getKeys(arr, inspect);
    if (indent && elements.some(el => el.includes('\n'))) {
        return `[\n${elements.map(el => `${indent.base}${el}`).join(`,\n${indent.base}`)}\n${indent.prev}]`;
    }
    return `[${elements.join(', ')}]`;
}

function formatMap(map, inspect, indent) {
    const entries = [];
    for (const [key, value] of map.entries()) {
        entries.push(`${inspect(key, map, true)} => ${inspect(value, map)}`);
    }
    return collectionFormat('Map', map.size, entries, indent);
}

function formatSet(set, inspect, indent) {
    const entries = [];
    for (const value of set.values()) {
        entries.push(inspect(value, set));
    }
    return collectionFormat('Set', set.size, entries, indent);
}

function collectionFormat(type, size, entries, indent) {
    const joinedEntries = indent ? `\n${indent.prev}${indent.base}${entries.join(`,\n${indent.prev}${indent.base}`)}\n${indent.prev}` : entries.join(', ');
    return `${type} (${size}) {${joinedEntries}}`;
}

function getIndent(opts, depth) {
    if (opts.indent === '\t') return { base: '\t', prev: '\t'.repeat(depth) };
    if (typeof opts.indent === 'number' && opts.indent > 0) return { base: ' '.repeat(opts.indent), prev: ' '.repeat(opts.indent * depth) };
    return null;
}

function getKeys(obj, inspect) {
    const keys = [];
    const isArrayObj = isOfType(obj, objectTypes.array);
    if (isArrayObj) {
        keys.length = obj.length;
        for (let i = 0; i < obj.length; i++) {
            keys[i] = hasProperty(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    for (const key in obj) {
        if (!hasProperty(obj, key)) continue;
        if ((/[^\w$]/).test(key)) {
            keys.push(`${inspect(key, obj, true)}: ${inspect(obj[key], obj)}`);
        } else {
            keys.push(`${key}: ${inspect(obj[key], obj)}`);
        }
    }
    if (typeof Object.getOwnPropertySymbols === 'function') {
        const symbols = Object.getOwnPropertySymbols(obj);
        for (const symbol of symbols) {
            if (isEnumerable.call(obj, symbol)) {
                keys.push(`[${inspect(symbol)}]: ${inspect(obj[symbol], obj)}`);
            }
        }
    }
    return keys;
}

function formatWeakMap() {
    return 'WeakMap { ? }';
}

function formatWeakSet() {
    return 'WeakSet { ? }';
}

function isMap(val) {
    return val instanceof Map;
}

function isSet(val) {
    return val instanceof Set;
}

function isWeakMap(val) {
    return val instanceof WeakMap;
}

function isWeakSet(val) {
    return val instanceof WeakSet;
}

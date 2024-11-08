const utilInspect = require('./util.inspect');

const hasMap = typeof Map === 'function';
const mapSize = hasMap ? Object.getOwnPropertyDescriptor(Map.prototype, 'size').get : null;
const hasSet = typeof Set === 'function';
const setSize = hasSet ? Object.getOwnPropertyDescriptor(Set.prototype, 'size').get : null;
const hasWeakMap = typeof WeakMap === 'function';
const weakMapHas = hasWeakMap ? WeakMap.prototype.has : null;
const hasWeakSet = typeof WeakSet === 'function';
const weakSetHas = hasWeakSet ? WeakSet.prototype.has : null;
const hasWeakRef = typeof WeakRef === 'function';
const weakRefDeref = hasWeakRef ? WeakRef.prototype.deref : null;
const booleanValueOf = Boolean.prototype.valueOf;
const functionToString = Function.prototype.toString;
const objectToString = Object.prototype.toString;
const bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
const hasShammedSymbols = typeof Symbol === 'function' && typeof Symbol.iterator === 'object';
const toStringTag = typeof Symbol === 'function' && Symbol.toStringTag ? Symbol.toStringTag : null;
const symToString = typeof Symbol === 'function' ? Symbol.prototype.toString : null;
const getObjectSymbols = Object.getOwnPropertySymbols;
const getPrototypeOf = Object.getPrototypeOf || ((o) => o.__proto__); // eslint-disable-line no-proto

function addNumericSeparator(num, str) {
    if (Number.isNaN(num) || Math.abs(num) < 1000 || /e/.test(str)) return str;
    const int = num < 0 ? Math.ceil(num) : Math.floor(num);
    if (int !== num) {
        const [intStr, dec] = String(num).split('.');
        return intStr.replace(/(\d)(?=(\d{3})+$)/g, '$1_') + '.' + (dec || '').replace(/(\d{3})/g, '$&_');
    }
    return str.replace(/(\d)(?=(\d{3})+$)/g, '$1_');
}

function inspect_(obj, options = {}, depth = 0, seen = []) {
    const opts = options;
    const { quoteStyle, maxStringLength, customInspect = true, indent = null, numericSeparator = false } = opts;

    if (quoteStyle && !['single', 'double'].includes(quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }

    if (typeof maxStringLength === 'number' && (maxStringLength < 0 && maxStringLength !== Infinity)) {
        throw new TypeError('option "maxStringLength", if provided, must be a non-negative integer, Infinity, or `null`');
    }

    if (![true, false, 'symbol'].includes(customInspect)) {
        throw new TypeError('option "customInspect", if provided, must be `true`, `false`, or `\'symbol\'`');
    }

    if (indent !== null && indent !== '\t' && (typeof indent !== 'number' || indent <= 0))
        throw new TypeError('option "indent" must be "\\t", a positive integer, or `null`');

    if (typeof numericSeparator !== 'boolean')
        throw new TypeError('option "numericSeparator", if provided, must be `true` or `false`');

    if (typeof obj === 'undefined') return 'undefined';
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj ? 'true' : 'false';
    if (typeof obj === 'string') return inspectString(obj, opts);
    if (typeof obj === 'number') {
        if (Object.is(obj, -0)) return '-0';
        const str = String(obj);
        return numericSeparator ? addNumericSeparator(obj, str) : str;
    }
    if (typeof obj === 'bigint') {
        const bigIntStr = obj.toString() + 'n';
        return numericSeparator ? addNumericSeparator(obj, bigIntStr) : bigIntStr;
    }

    const maxDepth = opts.depth ?? 5;
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') {
        return Array.isArray(obj) ? '[Array]' : '[Object]';
    }

    const currentIndent = depth ? (typeof indent === 'number' ? ' '.repeat(indent * depth) : indent.repeat(depth)) : '';

    if (seen.includes(obj)) return '[Circular]';

    function innerInspect(value, from, noIndent = false) {
        return inspect_(value, opts, noIndent ? depth : depth + 1, [...seen, from]);
    }

    if (typeof obj === 'function') {
        const keys = Object.keys(obj).map((key) => `${key}: ${innerInspect(obj[key], obj)}`);
        return `[Function${inspectFunctionName(obj)}]${keys.length ? ` { ${keys.join(', ')} }` : ''}`;
    }
    
    if (typeof obj === 'symbol') {
        const symbolStr = symToString.call(obj);
        return typeof obj === 'object' && !hasShammedSymbols ? `Object(${symbolStr})` : symbolStr;
    }

    if (isElement(obj)) {
        let s = `<${obj.nodeName.toLowerCase()}`;
        if (obj.attributes) {
            for (const attr of obj.attributes) {
                s += ` ${attr.name}="${attr.value}"`;
            }
        }
        s += obj.children.length ? '>...</' : '';
        s += `</${obj.nodeName.toLowerCase()}>`;
        return s;
    }

    if (Array.isArray(obj)) {
        const arrayStr = obj.length === 0 ? '[]' : `[ ${obj.map((item) => innerInspect(item, obj)).join(', ')} ]`;
        return arrayStr;
    }

    if (obj instanceof Error) {
        const errorProps = Object.keys(obj).map((key) => `${key}: ${innerInspect(obj[key], obj)}`);
        return `{ [Error: ${obj.message}] ${errorProps.join(', ')} }`;
    }
    
    if (typeof obj === 'object') {
        if (customInspect && typeof obj.inspect === 'function') return obj.inspect();
        if (typeof Symbol !== 'undefined' && obj[Symbol.for('nodejs.util.inspect.custom')]) {
            return utilInspect(obj, opts);
        }
        const objKeys = Object.keys(obj);
        const objectStr = `{ ${objKeys.map((key) => `${key}: ${innerInspect(obj[key], obj)}`).join(', ')} }`;
        return `${getObjectConstructorName(obj) || 'Object'} ${objectStr}`;
    }

    return String(obj);
}

module.exports = inspect_;

function inspectFunctionName(func) {
    try { return func.name ? `: ${func.name}` : ' (anonymous)'; } catch (e) { return ' (anonymous)'; }
}

function getObjectConstructorName(obj) {
    try { return obj.constructor ? obj.constructor.name : null; } catch (e) { return null; }
}

function isElement(obj) {
    return obj instanceof HTMLElement;
}

function inspectString(str, opts) {
    if (opts.maxStringLength && str.length > opts.maxStringLength) {
        return `${str.slice(0, opts.maxStringLength)}... ${str.length - opts.maxStringLength} more character${str.length - opts.maxStringLength > 1 ? 's' : ''}`;
    }
    const escapedStr = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, (char) => `\\x${char.charCodeAt(0).toString(16).padStart(2, '0')}`);
    const quoteStyle = opts.quoteStyle === 'double' ? '"' : "'";
    return `${quoteStyle}${escapedStr}${quoteStyle}`;
}

// Auxiliary functions for array handling and other utilities can be declared here...

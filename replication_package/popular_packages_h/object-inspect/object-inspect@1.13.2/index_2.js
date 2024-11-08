// Check existence and define specific properties and methods for certain JavaScript types
const hasMap = typeof Map === 'function' && Map.prototype;
const mapSizeDescriptor = Object.getOwnPropertyDescriptor?.(Map.prototype, 'size') || null;
const mapSize = hasMap && mapSizeDescriptor?.get || null;
const mapForEach = Map.prototype.forEach?.bind(Map.prototype);

const hasSet = typeof Set === 'function' && Set.prototype;
const setSizeDescriptor = Object.getOwnPropertyDescriptor?.(Set.prototype, 'size') || null;
const setSize = hasSet && setSizeDescriptor?.get || null;
const setForEach = Set.prototype.forEach?.bind(Set.prototype);

const hasWeakMap = typeof WeakMap === 'function' && WeakMap.prototype;
const weakMapHas = WeakMap.prototype.has?.bind(WeakMap.prototype);

const hasWeakSet = typeof WeakSet === 'function' && WeakSet.prototype;
const weakSetHas = WeakSet.prototype.has?.bind(WeakSet.prototype);

const hasWeakRef = typeof WeakRef === 'function' && WeakRef.prototype;
const weakRefDeref = WeakRef.prototype.deref?.bind(WeakRef.prototype);

const booleanValueOf = Boolean.prototype.valueOf.bind(Boolean.prototype);
const objectToString = Object.prototype.toString;
const functionToString = Function.prototype.toString.bind(Function.prototype);

const regexTest = RegExp.prototype.test.bind(RegExp.prototype);
const arrayJoin = Array.prototype.join.bind(Array.prototype);
const arraySlice = Array.prototype.slice.bind(Array.prototype);
const mathFloor = Math.floor;

const bigIntValueOf = BigInt.prototype.valueOf?.bind(BigInt.prototype);

const getOwnPropSymbols = Object.getOwnPropertySymbols;
const symbolToString = Symbol.prototype.toString?.bind(Symbol.prototype);
const toStringTag = typeof Symbol === 'function' && Symbol.toStringTag ? Symbol.toStringTag : null;

const getPrototypeOf = Reflect?.getPrototypeOf || Object.getPrototypeOf;

// Import utility functions for enhanced inspection
const utilInspect = require('./util.inspect');
const inspectCustom = utilInspect.custom;
const inspectSymbol = typeof inspectCustom === 'symbol' ? inspectCustom : null;

// Inspect function with customizable options
module.exports = function inspect_(obj, options = {}, depth = 0, seen = []) {
    const { quoteStyle, maxStringLength, customInspect = true, indent, numericSeparator } = options;

    if (quoteStyle && (quoteStyle !== 'single' && quoteStyle !== 'double')) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (maxStringLength != null) {
        if (typeof maxStringLength !== 'number' || maxStringLength < 0 && maxStringLength !== Infinity) {
            throw new TypeError('option "maxStringLength" must be a positive number, Infinity, or `null`');
        }
    }
    if (typeof customInspect !== 'boolean' && customInspect !== 'symbol') {
        throw new TypeError('option "customInspect" must be `true`, `false`, or `\'symbol\'`');
    }
    if (indent != null && indent !== '\t' && !(parseInt(indent, 10) === indent && indent > 0)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
    if (numericSeparator != null && typeof numericSeparator !== 'boolean') {
        throw new TypeError('option "numericSeparator" must be `true` or `false`');
    }

    if (obj === undefined) return 'undefined';
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj ? 'true' : 'false';

    if (typeof obj === 'string') return inspectString(obj, options);
    if (typeof obj === 'number') {
        return numberInspect(obj, numericSeparator);
    }
    if (typeof obj === 'bigint') {
        return bigintInspect(obj, numericSeparator);
    }
    
    const maxDepth = options.depth ?? 5;
    if (depth >= maxDepth && maxDepth > 0 && typeof obj === 'object') return Array.isArray(obj) ? '[Array]' : '[Object]';

    const indentObj = getIndent(options, depth);

    if (!seen.includes(obj)) seen.push(obj);

    function numberInspect(num, useSeparator) {
        const str = num === 0 ? (1 / num > 0 ? '0' : '-0') : String(num);
        return useSeparator ? addNumericSeparator(num, str) : str;
    }

    function bigintInspect(bigint, useSeparator) {
        const bigintString = String(bigint) + 'n';
        return useSeparator ? addNumericSeparator(bigint, bigintString) : bigintString;
    }

    function inspect(val, from, noIndent) {
        if (from) seen = arraySlice(seen).concat(from);
        return inspect_(val, options, depth + 1, seen);
    }

    if (typeof obj === 'function' && !isRegExp(obj)) {
        return functionInspect(obj, indentObj, inspect);
    }

    if (isSymbol(obj)) {
        return symbolInspect(obj);
    }

    if (isElement(obj)) {
        return elementInspect(obj);
    }

    if (Array.isArray(obj)) {
        return arrayInspect(obj, indentObj, inspect);
    }

    if (isError(obj)) {
        return errorInspect(obj, inspect);
    }

    if (typeof obj === 'object' && customInspect) {
        return objectCustomInspect(obj, maxDepth, depth, indentObj);
    }

    return genericObjectInspect(obj, indentObj, inspect);
};

// Supplementary methods for string replacements and object inspections
function wrapQuotes(str, style, opts) {
    const quoteChar = (opts.quoteStyle || style) === 'double' ? '"' : "'";
    return `${quoteChar}${str}${quoteChar}`;
}

function quote(s) {
    return String(s).replace(/"/g, '&quot;');
}

function isArray(obj) {
    return toStringTypeCheck(obj, 'Array');
}

function isDate(obj) {
    return toStringTypeCheck(obj, 'Date');
}

function isRegExp(obj) {
    return toStringTypeCheck(obj, 'RegExp');
}

function isError(obj) {
    return toStringTypeCheck(obj, 'Error');
}

function isString(obj) {
    return toStringTypeCheck(obj, 'String');
}

function isNumber(obj) {
    return toStringTypeCheck(obj, 'Number');
}

function isBoolean(obj) {
    return toStringTypeCheck(obj, 'Boolean');
}

function isSymbol(obj) {
    return typeof obj === 'symbol' || (typeof obj === 'object' && obj instanceof Symbol);
}

function isBigInt(obj) {
    return typeof obj === 'bigint';
}

function has(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}

function toStringTypeCheck(obj, type) {
    return objectToString.call(obj) === `[object ${type}]`;
}

function nameOf(func) {
    return func.name || functionToString.call(func).match(/^function\s*([\w$]+)/)?.[1] || null;
}

function indexOf(arr, item) {
    return arr.indexOf(item);
}

function isMap(val) {
    try {
        return mapSize?.call(val), !(setSize?.call(val)), val instanceof Map;
    } catch (_) { return false; }
}

function isWeakMap(val) {
    try {
        return weakMapHas?.call(val, weakMapHas), !(weakSetHas?.call(val, weakSetHas)), val instanceof WeakMap;
    } catch (_) { return false; }
}

function isWeakRef(obj) {
    try {
        weakRefDeref.call(obj);
        return true;
    } catch (_) { return false; }
}

function isSet(obj) {
    try {
        return setSize?.call(obj), !(mapSize?.call(obj)), obj instanceof Set;
    } catch (_) { return false; }
}

function isWeakSet(obj) {
    try {
        return weakSetHas?.call(obj, weakSetHas), !(weakMapHas?.call(obj, weakMapHas)), obj instanceof WeakSet;
    } catch (_) { return false; }
}

function isElement(x) {
    return typeof x === 'object' && (x instanceof HTMLElement || (typeof x.nodeName === 'string' && typeof x.getAttribute === 'function'));
}

function inspectString(str, opts) {
    const cutoff = opts.maxStringLength;
    if (cutoff != null && str.length > cutoff) {
        const extraChars = str.length - cutoff;
        const trailer = `... ${extraChars} more character${extraChars !== 1 ? 's' : ''}`;
        return inspectString(str.slice(0, cutoff), opts) + trailer;
    }
    const sanitizedString = str.replace(/(['\\])/g, '\\$1').replace(/[\x00-\x1f]/g, lowbyte);
    return wrapQuotes(sanitizedString, 'single', opts);
}

function lowbyte(c) {
    const controlCharMap = { 8: 'b', 9: 't', 10: 'n', 12: 'f', 13: 'r' };
    const charCode = c.charCodeAt(0);
    return `\\${controlCharMap[charCode] || 'x' + charCode.toString(16).padStart(2, '0').toUpperCase()}`;
}

function addNumericSeparator(num, str) {
    if (!Number.isFinite(num) || num > -1000 && num < 1000 || /e/.test(str)) return str;
    return str.replace(/\d(?=(\d{3})+$)/g, '$&_');
}

const inspectMethods = {
    functionInspect(obj, indentObj, inspect) {
        const name = nameOf(obj);
        const keys = objectKeys(obj, inspect);
        return `[Function${name ? ': ' + name : ' (anonymous)'}]${keys.length ? ' { ' + keys.join(', ') + ' }' : ''}`;
    },
    symbolInspect(obj) {
        const symbolStr = typeof obj === 'symbol' ? obj.toString().replace(/Symbol\((.*?)\)_.*/, 'Symbol($1)') : symbolToString.call(obj);
        return typeof obj === 'object' ? 'Object(' + symbolStr + ')' : symbolStr;
    },
    elementInspect(obj) {
        let result = `<${obj.nodeName.toLowerCase()}`;
        Array.from(obj.attributes || []).forEach(attr => {
            result += ` ${attr.name}=${wrapQuotes(quote(attr.value), 'double', options)}`;
        });
        result += '>';
        if (obj.childNodes.length) result += '...';
        result += `</${obj.nodeName.toLowerCase()}>`;
        return result;
    },
    arrayInspect(arr, indentObj, inspect) {
        if (!arr.length) return '[]';
        const elements = objectKeys(arr, inspect);
        if (indentObj && !elements.some(e => e.includes('\n'))) {
            return `[ ${elements.join(', ')} ]`;
        }
        return '[' + indentedJoin(elements, indentObj) + ']';
    },
    errorInspect(err, inspect) {
        const parts = objectKeys(err, inspect);
        const causeProp = 'cause' in Error.prototype ? '' : ('cause' in err && !Object.prototype.propertyIsEnumerable.call(err, 'cause')) ? '[cause]: ' + inspect(err.cause) : '';
        return `{ [${err}] ${parts.concat(causeProp).filter(Boolean).join(', ')} }`;
    },
    objectCustomInspect(obj, maxDepth, depth, indentObj) {
        if (inspectSymbol && typeof obj[inspectSymbol] === 'function' && utilInspect) {
            return utilInspect(obj, { depth: maxDepth - depth });
        } else if (customInspect !== 'symbol' && typeof obj.inspect === 'function') {
            return obj.inspect();
        }
        return '[Object]';
    },
    genericObjectInspect(obj, indentObj, inspect) {
        const isPlainObject = Object.getPrototypeOf(obj) === Object.prototype;
        const protoTag = !isPlainObject && '[null prototype]';
        const stringTag = Object.prototype.toString.call(obj).slice(8, -1);
        const constructorTag = obj.constructor !== Object && obj.constructor?.name ? obj.constructor.name + ' ' : '';
        const tag = constructorTag + (stringTag || protoTag ? `[${stringTag}${protoTag}] ` : '');
        const keys = objectKeys(obj, inspect);
        return tag + '{' + (indentObj ? indentedJoin(keys, indentObj) : keys.join(', ')) + '}';
    }
}

function objectKeys(obj, inspect) {
    if (Array.isArray(obj)) {
        return obj.map((v, i) => has(obj, i) ? inspect(v, obj) : '').concat(symbolKeys(obj, inspect));
    }
    return Object.keys(obj).map(k => inspectKey(k, obj, inspect)).concat(symbolKeys(obj, inspect));
}

function inspectKey(key, obj, inspect) {
    const keyStr = `/[\W]/.test(key)` ? inspect(key, obj) : key;
    return `${keyStr}: ${inspect(obj[key], obj)}`;
}

function symbolKeys(obj, inspect) {
    return (getOwnPropSymbols ? getOwnPropSymbols(obj) : []).filter(sym => Object.prototype.propertyIsEnumerable.call(obj, sym)).map(sym => `[${inspect(sym, obj)}]: ${inspect(obj[sym], obj)}`);
}

function generateIndent(opts, depth) {
    const base = opts.indent === '\t' ? '\t' : Array(opts.indent + 1).join(' ');
    return { base, prev: Array(depth + 1).join(base) };
}

function indentedJoin(arr, indent) {
    const joined = arr.join(`,\n${indent.prev}${indent.base}`);
    return `\n${indent.prev}${indent.base}${joined}\n${indent.prev}`;
}

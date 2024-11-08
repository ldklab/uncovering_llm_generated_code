const { custom } = require('./util.inspect');
const hasOwn = Object.prototype.hasOwnProperty;
const toStr = Object.prototype.toString;
const functionToString = Function.prototype.toString;
const booleanValueOf = Boolean.prototype.valueOf;
const objectToString = Object.prototype.toString;
let bigIntValueOf = typeof BigInt === 'function' ? BigInt.prototype.valueOf : null;
const symToString = typeof Symbol === 'function' ? Symbol.prototype.toString : null;
const isEnumerable = Object.prototype.propertyIsEnumerable;

const inspectCustom = custom ? custom : null;

module.exports = function inspect(obj, options = {}, depth = 0, seen = []) {
    validateOptions(options);

    if (seen.includes(obj)) {
        return '[Circular]';
    }

    if (typeof obj === 'undefined') return 'undefined';
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj ? 'true' : 'false';
    if (typeof obj === 'string') return inspectString(obj, options);
    if (typeof obj === 'number') return numberToString(obj);
    if (typeof obj === 'bigint') return `${obj}n`;

    if (depth >= (options.depth || 5) && options.depth !== 0) {
        return isArray(obj) ? '[Array]' : '[Object]';
    }

    const indent = getIndentation(options, depth);
    const ins = (v, from, noIndent) => {
        if (from) seen = seen.concat(from);
        return inspect(v, options, depth + 1, seen);
    };

    if (typeof obj === 'function') return inspectFunction(obj, ins);
    if (isSymbol(obj)) return inspectSymbol(obj);
    if (isElement(obj)) return inspectElement(obj, options);
    if (isArray(obj)) return inspectArray(obj, ins, indent);

    if (isError(obj)) return inspectError(obj, ins);
    if (isMap(obj)) return inspectMap(obj, ins, indent);
    if (isSet(obj)) return inspectSet(obj, ins, indent);
    if (isWeakMap(obj) || isWeakSet(obj)) return 'WeakCollection { ? }';
    
    if (customInspect(obj, options)) return inspectCustomObject(obj);

    if (!isDate(obj) && !isRegExp(obj)) {
        const keys = objectKeys(obj, ins);
        return formatObject(keys, indent);
    }

    return String(obj);
};

function validateOptions(options) {
    if (!['single', 'double'].includes(options.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }

    if (options.maxStringLength !== undefined && typeof options.maxStringLength !== 'number' && options.maxStringLength !== null) {
        throw new TypeError('option "maxStringLength", if provided, must be a positive integer, Infinity, or `null`');
    }

    if (typeof options.customInspect !== 'boolean') {
        throw new TypeError('option "customInspect", if provided, must be `true` or `false`');
    }

    if (options.indent !== undefined && options.indent !== '\t' && !(parseInt(options.indent, 10) === options.indent && options.indent > 0)) {
        throw new TypeError('options "indent" must be "\\t", an integer > 0, or `null`');
    }
}

function numberToString(num) {
    if (num === 0) return Infinity / num > 0 ? '0' : '-0';
    return String(num);
}

function inspectFunction(func, inspect) {
    const name = func.name || getFunctionName(func);
    const keys = objectKeys(func, inspect);
    return `[Function${name ? ': ' + name : ' (anonymous)'}]${keys.length > 0 ? ' { ' + keys.join(', ') + ' }' : ''}`;
}

function getFunctionName(func) {
    const match = functionToString.call(func).match(/^function\s*(\w+)/);
    return match ? match[1] : null;
}

function inspectSymbol(sym) {
    const symStr = symToString.call(sym);
    return typeof sym === 'object' ? `Object(${symStr})` : symStr;
}

function inspectElement(el, options) {
    const tag = String(el.nodeName).toLowerCase();
    const attrs = el.attributes || [];
    let s = `<${tag}`;
    for (let i = 0; i < attrs.length; i++) {
        s += ` ${attrs[i].name}=${wrapQuotes(quote(attrs[i].value), 'double', options)}`;
    }
    s += '>';
    if (el.childNodes && el.childNodes.length) s += '...';
    s += `</${tag}>`;
    return s;
}

function inspectArray(arr, inspect, indent) {
    if (arr.length === 0) return '[]';
    const xs = objectKeys(arr, inspect);
    if (indent && !singleLineValues(xs)) {
        return `[${indentedJoin(xs, indent)}]`;
    }
    return `[ ${xs.join(', ')} ]`;
}

function inspectError(err, inspect) {
    const parts = objectKeys(err, inspect);
    if (parts.length === 0) return `[${String(err)}]`;
    return `{ [${String(err)}] ${parts.join(', ')} }`;
}

function inspectMap(map, inspect, indent) {
    const parts = [];
    map.forEach((value, key) => {
        parts.push(`${inspect(key, map, true)} => ${inspect(value, map)}`);
    });
    return collectionOf('Map', map.size, parts, indent);
}

function inspectSet(set, inspect, indent) {
    const parts = [];
    set.forEach(value => {
        parts.push(inspect(value, set));
    });
    return collectionOf('Set', set.size, parts, indent);
}

function customInspect(obj, options) {
    return options.customInspect && typeof obj.inspect === 'function';
}

function inspectCustomObject(obj) {
    return obj[inspectCustom] ? obj[inspectCustom]() : obj.inspect();
}

function wrapQuotes(s, style, opts) {
    const quoteChar = (opts.quoteStyle || style) === 'double' ? '"' : "'";
    return quoteChar + s + quoteChar;
}

function quote(s) {
    return String(s).replace(/"/g, '&quot;');
}

function isArray(obj) { return toStr.call(obj) === '[object Array]'; }
function isDate(obj) { return toStr.call(obj) === '[object Date]'; }
function isRegExp(obj) { return toStr.call(obj) === '[object RegExp]'; }
function isSymbol(obj) { return toStr.call(obj) === '[object Symbol]'; }
function isElement(x) {
    return x && typeof x === 'object' && (
        (typeof HTMLElement !== 'undefined' && x instanceof HTMLElement) ||
        (typeof x.nodeName === 'string' && typeof x.getAttribute === 'function')
    );
}

function getIndentation(options, depth) {
    const baseIndent = options.indent === '\t' ? '\t' : ' '.repeat(options.indent);
    return baseIndent ? { base: baseIndent, prev: baseIndent.repeat(depth) } : null;
}

function singleLineValues(xs) {
    return !xs.some(x => x.includes('\n'));
}

function indentedJoin(xs, indent) {
    if (!xs.length) return '';
    const lineJoiner = `\n${indent.prev}${indent.base}`;
    return lineJoiner + xs.join(`,${lineJoiner}`) + `\n${indent.prev}`;
}

function objectKeys(obj, inspect) {
    const isArr = isArray(obj);
    const keys = [];
    if (isArr) {
        keys.length = obj.length;
        for (let i = 0; i < obj.length; i++) {
            keys[i] = hasOwnProperty(obj, i) ? inspect(obj[i], obj) : '';
        }
    }
    for (const key in obj) {
        if (!hasOwnProperty(obj, key)) continue;
        if (isArr && String(Number(key)) === key && key < obj.length) continue;

        keys.push((/\W/.test(key) ? `${inspect(key, obj)}: ` : `${key}: `) + inspect(obj[key], obj));
    }
    return keys.concat(getSymbolKeys(obj, inspect));
}

function getSymbolKeys(obj, inspect) {
    return typeof Object.getOwnPropertySymbols === 'function'
        ? Object.getOwnPropertySymbols(obj).filter(sym => isEnumerable.call(obj, sym)).map(sym => `[${inspect(sym)}]: ${inspect(obj[sym], obj)}`)
        : [];
}

function hasOwnProperty(obj, prop) {
    return hasOwn.call(obj, prop);
}

function collectionOf(type, size, entries, indent) {
    return `${type} (${size}) {${indent ? indentedJoin(entries, indent) : ` ${entries.join(', ')} `}}`;
}

function formatObject(keys, indent) {
    return keys.length === 0 ? '{}' : indent ? `{${indentedJoin(keys, indent)}}` : `{ ${keys.join(', ')} }`;
}

const inspectCustom = require('./util.inspect').custom;

module.exports = function inspect_(obj, options = {}, depth = 0, seen = []) {
    verifyOptions(options);

    if (typeof obj === 'undefined') return 'undefined';
    if (obj === null) return 'null';
    if (typeof obj === 'boolean') return obj ? 'true' : 'false';
    if (typeof obj === 'string') return inspectString(obj, options);
    if (typeof obj === 'number') return formatNumber(obj);
    if (typeof obj === 'bigint') return `${String(obj)}n`;

    const maxDepth = options.depth || 5;
    if (depth >= maxDepth && typeof obj === 'object') {
        return isArray(obj) ? '[Array]' : '[Object]';
    }

    if (seen.includes(obj)) return '[Circular]';

    const newSeen = [...seen, obj];
    const indent = getIndent(options, depth);

    function inspect(value, from, noIndent) {
        const newOpts = noIndent ? { depth: options.depth } : options;
        return inspect_(value, newOpts, depth + 1, from ? [...newSeen, from] : newSeen);
    }

    if (typeof obj === 'function') return inspectFunction(obj, inspect);
    if (isSymbol(obj)) return formatSymbol(obj);
    if (isElement(obj)) return formatElement(obj, options);
    if (isArray(obj)) return formatArray(obj, inspect, indent);
    if (isError(obj)) return formatError(obj, inspect);
    if (typeof obj === 'object' && options.customInspect !== false) {
        const result = callCustomInspect(obj, inspectCustom, options);
        if (typeof result === 'string') return result;
    }
    if (isMap(obj)) return formatMap(obj, inspect, indent);
    if (isSet(obj)) return formatSet(obj, inspect, indent);
    if (isWeakMap(obj)) return 'WeakMap { ? }';
    if (isWeakSet(obj)) return 'WeakSet { ? }';

    return formatObject(obj, inspect, indent);
};

function verifyOptions(opts) {
    if (opts.quoteStyle && !['single', 'double'].includes(opts.quoteStyle)) {
        throw new TypeError('option "quoteStyle" must be "single" or "double"');
    }
    if (opts.maxStringLength && (typeof opts.maxStringLength !== 'number' || opts.maxStringLength < 0)) {
        throw new TypeError('option "maxStringLength" must be a positive integer, Infinity, or `null`');
    }
    if (opts.customInspect !== undefined && typeof opts.customInspect !== 'boolean') {
        throw new TypeError('option "customInspect" must be `true` or `false`');
    }
    if (opts.indent !== undefined && opts.indent !== null && opts.indent !== '\t' && !(Number.isInteger(opts.indent) && opts.indent > 0)) {
        throw new TypeError('option "indent" must be "\\t", an integer > 0, or `null`');
    }
}

// Utility functions
function formatNumber(num) {
    return num === 0 ? (1 / num > 0 ? '0' : '-0') : String(num);
}

function formatSymbol(symbol) {
    return typeof symbol === 'object' ? `Object(${String(symbol)})` : String(symbol);
}

function getIndent(opts, depth) {
    if (opts.indent === '\t') return { base: '\t', prev: '\t'.repeat(depth) };
    if (typeof opts.indent === 'number' && opts.indent > 0) return { base: ' '.repeat(opts.indent), prev: ' '.repeat(opts.indent * depth) };
    return null;
}

function isArray(obj) {
    return Array.isArray(obj);
}

function isSymbol(obj) {
    return typeof obj === 'symbol';
}

function isElement(obj) {
    return obj instanceof HTMLElement || (typeof obj.nodeName === 'string' && typeof obj.getAttribute === 'function');
}

function isMap(obj) {
    return obj instanceof Map;
}

function isSet(obj) {
    return obj instanceof Set;
}

function isWeakMap(obj) {
    return obj instanceof WeakMap;
}

function isWeakSet(obj) {
    return obj instanceof WeakSet;
}

// More detailed utility and helper functions are assumed to exist for string formatting and object property inspection.

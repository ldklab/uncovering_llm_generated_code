// serialize-javascript.js

function escapeString(str) {
    return str.replace(/</g, '\\u003C').replace(/>/g, '\\u003E').replace(/\//g, '\\u002F')
         .replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}

function serializeValue(value, options = {}) {
    if (value === undefined) {
        return 'undefined';
    } else if (typeof value === 'function' && !options.ignoreFunction) {
        return value.toString();
    } else if (value instanceof RegExp) {
        return value.toString();
    } else if (value instanceof Date) {
        return `new Date(${JSON.stringify(value.toISOString())})`;
    } else if (value instanceof Map) {
        return `new Map(${serializeValue(Array.from(value.entries()), options)})`;
    } else if (value instanceof Set) {
        return `new Set(${serializeValue(Array.from(value.values()), options)})`;
    } else if (typeof value === 'bigint') {
        return `BigInt("${value.toString()}")`;
    } else if (value instanceof URL) {
        return `new URL(${JSON.stringify(value.toString())})`;
    } else if (typeof value === 'string' && !options.unsafe) {
        return JSON.stringify(escapeString(value));
    }
    return JSON.stringify(value, null, options.space);
}

function serialize(object, options = {}) {
    if (!options.isJSON) {
        return `{${Object.entries(object)
            .map(([key, value]) => `${JSON.stringify(key)}:${serializeValue(value, options)}`)
            .join(',')}}`;
    }
    return JSON.stringify(object, null, options.space);
}

module.exports = serialize;

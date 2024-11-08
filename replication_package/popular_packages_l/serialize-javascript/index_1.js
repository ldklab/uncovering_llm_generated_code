// serializer.js

// Escapes string to prevent XSS or control character issues
const escapeString = (str) => {
    return str.replace(/</g, '\\u003C')
              .replace(/>/g, '\\u003E')
              .replace(/\//g, '\\u002F')
              .replace(/\n/g, '\\n')
              .replace(/\r/g, '\\r')
              .replace(/\t/g, '\\t');
};

// Recursively serializes each value according to its type
const serializeValue = (value, options = {}) => {
    switch (true) {
        case value === undefined:
            return 'undefined';
        case typeof value === 'function' && !options.ignoreFunction:
            return value.toString();
        case value instanceof RegExp:
            return value.toString();
        case value instanceof Date:
            return `new Date(${JSON.stringify(value.toISOString())})`;
        case value instanceof Map:
            return `new Map(${serializeValue([...value.entries()], options)})`;
        case value instanceof Set:
            return `new Set(${serializeValue([...value.values()], options)})`;
        case typeof value === 'bigint':
            return `BigInt("${value.toString()}")`;
        case value instanceof URL:
            return `new URL(${JSON.stringify(value.toString())})`;
        case typeof value === 'string' && !options.unsafe:
            return JSON.stringify(escapeString(value));
        default:
            return JSON.stringify(value, null, options.space);
    }
};

// Main serialization function for objects
const serialize = (object, options = {}) => {
    const isJSON = options.isJSON === true;
    const serializer = isJSON ? JSON.stringify : (obj) => {
        const entries = Object.entries(obj)
            .map(([key, value]) => `${JSON.stringify(key)}:${serializeValue(value, options)}`)
            .join(',');
        return `{${entries}}`;
    };
    return serializer(object, null, options.space);
};

module.exports = serialize;

// serialize.js

function escapeSpecialChars(str) {
    const escapeMap = {
        '<': '\\u003C',
        '>': '\\u003E',
        '/': '\\u002F',
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t'
    };
    return str.replace(/[<>\/\n\r\t]/g, char => escapeMap[char]);
}

function stringify(value, opts = {}) {
    if (value === undefined) return 'undefined';
  
    switch (true) {
        case typeof value === 'function' && !opts.ignoreFunction:
            return value.toString();
        case value instanceof RegExp:
            return value.toString();
        case value instanceof Date:
            return `new Date(${JSON.stringify(value.toISOString())})`;
        case value instanceof Map:
            return `new Map(${stringify([...value.entries()], opts)})`;
        case value instanceof Set:
            return `new Set(${stringify([...value.values()], opts)})`;
        case typeof value === 'bigint':
            return `BigInt("${value.toString()}")`;
        case value instanceof URL:
            return `new URL(${JSON.stringify(value.toString())})`;
        case typeof value === 'string' && !opts.unsafe:
            return JSON.stringify(escapeSpecialChars(value));
        default:
            return JSON.stringify(value, null, opts.space);
    }
}

function serialize(input, opts = {}) {
    if (opts.isJSON) {
        return JSON.stringify(input, null, opts.space);
    }
    const entries = Object.entries(input).map(
        ([key, val]) => `${JSON.stringify(key)}:${stringify(val, opts)}`
    );
    return `{${entries.join(',')}}`;
}

module.exports = serialize;

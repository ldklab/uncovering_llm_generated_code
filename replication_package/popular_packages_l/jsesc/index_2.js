const jsesc = (value, options = {}) => {
    const defaultOptions = {
        quotes: 'single',
        numbers: 'decimal',
        wrap: false,
        es6: false,
        escapeEverything: false,
        minimal: false,
        isScriptContext: false,
        compact: true,
        indent: '\t',
        indentLevel: 0,
        json: false,
        lowercaseHex: false
    };

    options = { ...defaultOptions, ...options };

    const escapeChar = (char) => {
        const codePoint = char.codePointAt(0);
        let hexDigits = codePoint.toString(16);
        if (options.lowercaseHex) hexDigits = hexDigits.toLowerCase();

        return options.es6 && codePoint > 0xFFFF ? `\\u{${hexDigits}}` : `\\u${hexDigits.padStart(4, '0')}`;
    };

    const escapeString = (string) => {
        if (options.escapeEverything) {
            return [...string].map(escapeChar).join('');
        }
        return string.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\0-\x7F]/g, escapeChar);
    };

    const wrapString = (string) => {
        if (!options.wrap) return string;
        const quote = options.quotes === 'double' ? '"' : options.quotes === 'backtick' ? '`' : "'";
        return `${quote}${string}${quote}`;
    };

    const stringify = (value) => {
        if (typeof value === 'number') {
            switch (options.numbers) {
                case 'binary': return `0b${value.toString(2)}`;
                case 'octal': return `0o${value.toString(8)}`;
                case 'hexadecimal': return `0x${value.toString(16)}`;
                default: return value.toString();
            }
        }

        if (typeof value === 'string') {
            return wrapString(escapeString(value));
        }

        if (Array.isArray(value)) {
            const elements = value.map(stringify);
            return options.compact ? `[${elements.join(',')}]` : `[\n${options.indent}${elements.join(',\n' + options.indent)}\n]`;
        }

        if (value && typeof value === 'object') {
            const entries = Object.entries(value).map(([k, v]) =>
                `${options.indent}${wrapString(escapeString(k))}:${stringify(v)}`
            );
            return options.compact ? `{${entries.join(',')}}` : `{\n${entries.join(',\n')}\n}`;
        }

        return JSON.stringify(value);
    };

    return stringify(value);
};

module.exports = jsesc;

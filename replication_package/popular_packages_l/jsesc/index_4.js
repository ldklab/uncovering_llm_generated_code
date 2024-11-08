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

    const mergedOptions = { ...defaultOptions, ...options };

    const escapeCharacter = (char) => {
        const codePoint = char.codePointAt(0);
        let hexString = codePoint.toString(16);
        if (mergedOptions.lowercaseHex) {
            hexString = hexString.toLowerCase();
        }

        if (mergedOptions.es6 && codePoint > 0xFFFF) {
            return `\\u{${hexString}}`;
        }
        return `\\u${'0000'.slice(hexString.length)}${hexString}`;
    };

    const escapeText = (text) => {
        if (mergedOptions.escapeEverything) {
            return text.split('').map(escapeCharacter).join('');
        }
        return text.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\0-\x7F]/g, escapeCharacter);
    };

    const wrapText = (text) => {
        if (!mergedOptions.wrap) return text;
        const openingQuote = mergedOptions.quotes === 'double' ? '"' : mergedOptions.quotes === 'backtick' ? '`' : "'";
        return `${openingQuote}${text}${openingQuote}`;
    };

    const processValue = (value) => {
        if (typeof value === 'number') {
            return {
                'binary': `0b${value.toString(2)}`,
                'octal': `0o${value.toString(8)}`,
                'hexadecimal': `0x${value.toString(16)}`
            }[mergedOptions.numbers] || value.toString();
        }

        if (typeof value === 'string') {
            return wrapText(escapeText(value));
        }

        if (Array.isArray(value)) {
            const elements = value.map(processValue);
            return mergedOptions.compact ? `[${elements.join(',')}]` : `[\n${mergedOptions.indent}${elements.join(`,\n${mergedOptions.indent}`)}\n]`;
        }

        if (value && typeof value === 'object') {
            const formattedEntries = Object.entries(value).map(([key, val]) => {
                return `${mergedOptions.indent}${wrapText(escapeText(key))}:${processValue(val)}`;
            });
            return mergedOptions.compact ? `{${formattedEntries.join(',')}}` : `{\n${formattedEntries.join(`,\n`)}\n}`;
        }

        return JSON.stringify(value);
    };

    return processValue(value);
};

module.exports = jsesc;

(() => {
    const isNode = typeof exports === 'object' && typeof module !== 'undefined';
    const isAMD = typeof define === 'function' && define.amd;
    const globalContext = typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : self);
    const exportsObject = {};

    if (isNode) {
        module.exports = exportsObject;
    } else if (isAMD) {
        define([], () => exportsObject);
    } else {
        globalContext.htmlEntities = exportsObject;
    }

    const namedReferences = require('./named-references');
    const numericUnicodeMap = require('./numeric-unicode-map');
    const { fromCodePoint, getCodePoint } = require('./surrogate-pairs');

    const i = Object.assign({}, namedReferences, { all: namedReferences.html5 });

    const regexPatterns = {
        specialChars: /[<>'"&]/g,
        nonAsciiPrintable: /[<>'"&\x01-\x08\x11-\x15\x17-\x1F\x7f-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g,
        nonAscii: /[<>'"&\u0080-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g
    };

    const defaultEncodeOptions = { mode: "specialChars", level: "all", numeric: "decimal" };

    exportsObject.encode = (str, options = defaultEncodeOptions) => {
        if (!str) return '';
        const { mode = "specialChars", level = "all", numeric = "decimal" } = options;
        const useHex = numeric === "hexadecimal";

        const charMap = i[level === "all" ? "all" : level].characters;

        return str.replace(regexPatterns[mode], char => {
            if (charMap[char]) return charMap[char];

            const codePoint = char.length > 1 ? getCodePoint(char, 0) : char.charCodeAt(0);
            return useHex ? `&#x${codePoint.toString(16)};` : `&#${codePoint};`;
        });
    };

    const defaultDecodeOptions = { scope: "body", level: "all" };

    const entityRegex = {
        strict: /&(?:#\d+|#x[\da-fA-F]+|[0-9a-zA-Z]+);/g,
        body: /&(?:#\d+|#x[\da-fA-F]+|[0-9a-zA-Z]+);?/g,
        attribute: /&(?:#\d+|#x[\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g
    };

    const charFromCode = String.fromCharCode;

    exportsObject.decode = (str, options = defaultDecodeOptions) => {
        if (!str) return '';
        const { level = "all", scope = "body" } = options;
        const map = i[level].entities;
        const isAttr = scope === "attribute";

        return str.replace(entityRegex[scope], entity => {
            if (isAttr && entity.endsWith('=')) return entity;
            if (entity[1] !== '#') return map[entity] || entity;

            const isHex = entity[2] === 'x' || entity[2] === 'X';
            const codePoint = isHex ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2));
            return codePoint > 65535 ? fromCodePoint(codePoint) : charFromCode(numericUnicodeMap[codePoint] || codePoint);
        });
    };
})();

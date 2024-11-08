"use strict";

const { namedReferences, bodyRegExps } = require("./named-references");
const { numericUnicodeMap } = require("./numeric-unicode-map");
const { getCodePoint, fromCodePoint } = require("./surrogate-pairs");

function assign(target, ...sources) {
    for (const source of sources) {
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                target[key] = source[key];
            }
        }
    }
    return target;
}

const allNamedReferences = assign({}, namedReferences, { all: namedReferences.html5 });

function replaceUsingRegExp(text, regex, replacer) {
    regex.lastIndex = 0;
    let result = "";
    let lastIndex = 0;
    for (let match; (match = regex.exec(text));) {
        if (lastIndex !== match.index) {
            result += text.slice(lastIndex, match.index);
        }
        result += replacer(match[0]);
        lastIndex = match.index + match[0].length;
    }
    result += text.slice(lastIndex);
    return result;
}

const encodeRegExps = {
    specialChars: /[<>'"&]/g,
    nonAscii: /[\u0080-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
    nonAsciiPrintable: /[\x01-\x08\x11-\x1F\x7F-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
    nonAsciiPrintableOnly: /[\x01-\x08\x11-\x1F\x7F-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g,
    extensive: /[\x01-\x0C\x0E-\x1F\x21-\x7E\x7F-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/g
};

const defaultEncodeOptions = { mode: "specialChars", level: "all", numeric: "decimal" };

function encode(text, options = defaultEncodeOptions) {
    if (!text) return "";
    const { mode = "specialChars", numeric = "decimal", level = "all" } = options;
    const regex = encodeRegExps[mode];
    const references = allNamedReferences[level].characters;
    const isHex = numeric === "hexadecimal";

    return replaceUsingRegExp(text, regex, (input) => {
        let result = references[input];
        if (!result) {
            const code = input.length > 1 ? getCodePoint(input, 0) : input.charCodeAt(0);
            result = isHex ? `&#x${code.toString(16)};` : `&#${code};`;
        }
        return result;
    });
}

const defaultDecodeOptions = { scope: "body", level: "all" };
const strict = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);/g;
const attribute = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g;
const baseDecodeRegExps = {
    xml: { strict, attribute, body: bodyRegExps.xml },
    html4: { strict, attribute, body: bodyRegExps.html4 },
    html5: { strict, attribute, body: bodyRegExps.html5 }
};
const decodeRegExps = assign({}, baseDecodeRegExps, { all: baseDecodeRegExps.html5 });

const fromCharCode = String.fromCharCode;
const outOfBoundsChar = fromCharCode(65533);
const defaultDecodeEntityOptions = { level: "all" };

function getDecodedEntity(entity, references, isAttribute, isStrict) {
    let result = entity;
    const lastChar = entity[entity.length - 1];
    if (isAttribute && lastChar === "=" || isStrict && lastChar !== ";") {
        return result;
    }

    const byReference = references[entity];
    if (byReference) {
        result = byReference;
    } else if (entity.startsWith("&#")) {
        const secondChar = entity[2];
        const code = secondChar.toLowerCase() === "x"
            ? parseInt(entity.slice(3), 16)
            : parseInt(entity.slice(2));
        result = code >= 1114111 ? outOfBoundsChar :
                 code > 65535 ? fromCodePoint(code) :
                 fromCharCode(numericUnicodeMap[code] || code);
    }
    return result;
}

function decodeEntity(entity, options = defaultDecodeEntityOptions) {
    const { level = "all" } = options;
    if (!entity) return "";
    return getDecodedEntity(entity, allNamedReferences[level].entities, false, false);
}

function decode(text, options = defaultDecodeOptions) {
    if (!text) return "";
    const { level = "all", scope = level === "xml" ? "strict" : "body" } = options;
    const regex = decodeRegExps[level][scope];
    const references = allNamedReferences[level].entities;
    const isAttribute = scope === "attribute";
    const isStrict = scope === "strict";

    return replaceUsingRegExp(text, regex, (entity) => getDecodedEntity(entity, references, isAttribute, isStrict));
}

exports.encode = encode;
exports.decodeEntity = decodeEntity;
exports.decode = decode;

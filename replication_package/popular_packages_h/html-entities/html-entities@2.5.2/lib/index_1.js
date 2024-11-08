"use strict";
const { namedReferences, bodyRegExps } = require("./named-references");
const { numericUnicodeMap } = require("./numeric-unicode-map");
const { getCodePoint, fromCodePoint } = require("./surrogate-pairs");

const allNamedReferences = (() => {
    return {
        ...namedReferences,
        all: namedReferences.html5
    };
})();

function replaceUsingRegExp(text, regExp, replacer) {
    regExp.lastIndex = 0;
    let match, result = "";
    let lastIndex = 0;

    while ((match = regExp.exec(text)) !== null) {
        if (lastIndex !== match.index) {
            result += text.substring(lastIndex, match.index);
        }

        const input = match[0];
        result += replacer(input);
        lastIndex = match.index + input.length;
    }

    if (lastIndex !== text.length) {
        result += text.substring(lastIndex);
    }

    return result || text;
}

const encodeRegExps = {
    specialChars: /[<>'"&]/g,
    nonAscii: /[\u0080-\uFFFF]/g,
    extensive: /[\x01-\x1F\x7F-\uFFFF]/g
};

const defaultEncodeOptions = {
    mode: "specialChars",
    level: "all",
    numeric: "decimal"
};

function encode(text, options = defaultEncodeOptions) {
    if (!text) return "";

    const { mode = "specialChars", level = "all", numeric = "decimal" } = options;
    const encodeRegExp = encodeRegExps[mode];
    const references = allNamedReferences[level].characters;
    const isHex = numeric === "hexadecimal";

    return replaceUsingRegExp(text, encodeRegExp, (input) => {
        let result = references[input];
        if (!result) {
            const code = input.length > 1 ? getCodePoint(input, 0) : input.charCodeAt(0);
            result = isHex ? `&#x${code.toString(16)};` : `&#${code};`;
        }
        return result;
    });
}

exports.encode = encode;

const defaultDecodeOptions = {
    scope: "body",
    level: "all"
};

const strict = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+);/g;
const attribute = /&(?:#\d+|#[xX][\da-fA-F]+|[0-9a-zA-Z]+)[;=]?/g;

const baseDecodeRegExps = {
    xml: { strict, attribute, body: bodyRegExps.xml },
    html4: { strict, attribute, body: bodyRegExps.html4 },
    html5: { strict, attribute, body: bodyRegExps.html5 }
};

const decodeRegExps = { ...baseDecodeRegExps, all: baseDecodeRegExps.html5 };

const fromCharCode = String.fromCharCode;
const outOfBoundsChar = fromCharCode(65533);

const defaultDecodeEntityOptions = { level: "all" };

function getDecodedEntity(entity, references, isAttribute, isStrict) {
    let result = entity;
    const lastChar = entity[entity.length - 1];

    if (isAttribute && lastChar === "=") {
        result = entity;
    } else if (isStrict && lastChar !== ";") {
        result = entity;
    } else {
        const refResult = references[entity];
        if (refResult) {
            result = refResult;
        } else if (entity.startsWith("&#")) {
            const code = entity[2].toLowerCase() === "x"
                ? parseInt(entity.substr(3), 16)
                : parseInt(entity.substr(2));
            result = code > 1114111 ? outOfBoundsChar : code > 65535
                ? fromCodePoint(code)
                : fromCharCode(numericUnicodeMap[code] || code);
        }
    }
    return result;
}

function decodeEntity(entity, options = defaultDecodeEntityOptions) {
    const { level = "all" } = options;
    if (!entity) return "";
    return getDecodedEntity(entity, allNamedReferences[level].entities, false, false);
}

exports.decodeEntity = decodeEntity;

function decode(text, options = defaultDecodeOptions) {
    if (!text) return "";

    const { level = "all", scope = level === "xml" ? "strict" : "body" } = options;
    const decodeRegExp = decodeRegExps[level][scope];
    const references = allNamedReferences[level].entities;
    const isAttribute = scope === "attribute";
    const isStrict = scope === "strict";

    return replaceUsingRegExp(text, decodeRegExp, (entity) => {
        return getDecodedEntity(entity, references, isAttribute, isStrict);
    });
}

exports.decode = decode;

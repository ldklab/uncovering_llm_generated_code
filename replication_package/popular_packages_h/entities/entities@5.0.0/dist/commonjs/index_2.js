"use strict";

const decodeModule = require("./decode.js");
const encodeModule = require("./encode.js");
const escapeModule = require("./escape.js");

// Enum for the levels of entity support
var EntityLevel = {
    XML: 0,
    HTML: 1,
};
exports.EntityLevel = EntityLevel;

// Enum for encoding modes
var EncodingMode = {
    UTF8: 0,
    ASCII: 1,
    Extensive: 2,
    Attribute: 3,
    Text: 4,
};
exports.EncodingMode = EncodingMode;

// Decoding functions
function decode(input, options = EntityLevel.XML) {
    const level = typeof options === "number" ? options : options.level;
    if (level === EntityLevel.HTML) {
        const mode = typeof options === "object" ? options.mode : undefined;
        return decodeModule.decodeHTML(input, mode);
    }
    return decodeModule.decodeXML(input);
}

function decodeStrict(input, options = EntityLevel.XML) {
    const normalizedOptions = typeof options === "number" ? { level: options } : options;
    normalizedOptions.mode = normalizedOptions.mode || decodeModule.DecodingMode.Strict;
    return decode(input, normalizedOptions);
}

// Encoding functions
function encode(input, options = EntityLevel.XML) {
    const { mode = EncodingMode.Extensive, level = EntityLevel.XML } = typeof options === "number" ? { level: options } : options;
    switch (mode) {
        case EncodingMode.UTF8:
            return escapeModule.escapeUTF8(input);
        case EncodingMode.Attribute:
            return escapeModule.escapeAttribute(input);
        case EncodingMode.Text:
            return escapeModule.escapeText(input);
        default:
            if (level === EntityLevel.HTML) {
                if (mode === EncodingMode.ASCII) {
                    return encodeModule.encodeNonAsciiHTML(input);
                }
                return encodeModule.encodeHTML(input);
            }
            return escapeModule.encodeXML(input);
    }
}

// Expose functions and constants
exports.decode = decode;
exports.decodeStrict = decodeStrict;
exports.encode = encode;
Object.defineProperty(exports, "encodeXML", { enumerable: true, get: () => escapeModule.encodeXML });
Object.defineProperty(exports, "escapeUTF8", { enumerable: true, get: () => escapeModule.escapeUTF8 });
Object.defineProperty(exports, "escapeAttribute", { enumerable: true, get: () => escapeModule.escapeAttribute });
Object.defineProperty(exports, "escapeText", { enumerable: true, get: () => escapeModule.escapeText });
Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: () => encodeModule.encodeHTML });
Object.defineProperty(exports, "encodeNonAsciiHTML", { enumerable: true, get: () => encodeModule.encodeNonAsciiHTML });
Object.defineProperty(exports, "EntityDecoder", { enumerable: true, get: () => decodeModule.EntityDecoder });
Object.defineProperty(exports, "DecodingMode", { enumerable: true, get: () => decodeModule.DecodingMode });
Object.defineProperty(exports, "decodeXML", { enumerable: true, get: () => decodeModule.decodeXML });
Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: () => decodeModule.decodeHTML });
Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: () => decodeModule.decodeHTMLStrict });
Object.defineProperty(exports, "decodeHTMLAttribute", { enumerable: true, get: () => decodeModule.decodeHTMLAttribute });

// Legacy aliases for backward compatibility
Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: () => encodeModule.encodeHTML });
Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: () => encodeModule.encodeHTML });
Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: () => decodeModule.decodeHTML });
Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: () => decodeModule.decodeHTML });
Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: () => decodeModule.decodeHTMLStrict });
Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: () => decodeModule.decodeHTMLStrict });
Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: () => decodeModule.decodeXML });

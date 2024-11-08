"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLAttribute = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.DecodingMode = exports.EntityDecoder = exports.encodeHTML5 = exports.encodeHTML4 = exports.encodeNonAsciiHTML = exports.encodeHTML = exports.escapeText = exports.escapeAttribute = exports.escapeUTF8 = exports.encodeXML = exports.EncodingMode = exports.EntityLevel = void 0;

const { decodeHTML, decodeXML, DecodingMode, decodeHTMLStrict, decodeHTMLAttribute, decodeXMLStrict } = require("./decode.js");
const { encodeHTML, encodeNonAsciiHTML, encodeHTML5, encodeHTML4 } = require("./encode.js");
const { escapeUTF8, escapeAttribute, escapeText, encodeXML, escape, encodeXML: xmlEncode } = require("./escape.js");

var EntityLevel;
(function (EntityLevel) {
    EntityLevel[EntityLevel["XML"] = 0] = "XML";
    EntityLevel[EntityLevel["HTML"] = 1] = "HTML";
})(EntityLevel || (exports.EntityLevel = EntityLevel = {}));

var EncodingMode;
(function (EncodingMode) {
    EncodingMode[EncodingMode["UTF8"] = 0] = "UTF8";
    EncodingMode[EncodingMode["ASCII"] = 1] = "ASCII";
    EncodingMode[EncodingMode["Extensive"] = 2] = "Extensive";
    EncodingMode[EncodingMode["Attribute"] = 3] = "Attribute";
    EncodingMode[EncodingMode["Text"] = 4] = "Text";
})(EncodingMode || (exports.EncodingMode = EncodingMode = {}));

function decode(input, options = EntityLevel.XML) {
    const level = typeof options === "number" ? options : options.level;
    const mode = typeof options === "object" ? options.mode : undefined;
    return (level === EntityLevel.HTML) ? decodeHTML(input, mode) : decodeXML(input);
}

function decodeStrict(input, options = EntityLevel.XML) {
    const { level, mode = DecodingMode.Strict } = typeof options === "number" ? { level: options } : options;
    return decode(input, { level, mode });
}

function encode(input, options = EntityLevel.XML) {
    const { mode = EncodingMode.Extensive, level = EntityLevel.XML } = typeof options === "number" ? { level: options } : options;
    switch (mode) {
        case EncodingMode.UTF8: return escapeUTF8(input);
        case EncodingMode.Attribute: return escapeAttribute(input);
        case EncodingMode.Text: return escapeText(input);
        default:
            return (level === EntityLevel.HTML) ? ((mode === EncodingMode.ASCII) ? encodeNonAsciiHTML(input) : encodeHTML(input)) : xmlEncode(input);
    }
}

exports.decode = decode;
exports.decodeStrict = decodeStrict;
exports.encode = encode;
exports.encodeXML = xmlEncode;
exports.escape = escape;
exports.EntityDecoder = require("./decode.js").EntityDecoder;
// Legacy aliases (deprecated) are provided below
exports.encodeHTML5 = encodeHTML;
exports.encodeHTML4 = encodeHTML;
exports.decodeHTML4 = decodeHTML;
exports.decodeHTML5 = decodeHTML;
exports.decodeHTML4Strict = decodeHTMLStrict;
exports.decodeHTML5Strict = decodeHTMLStrict;
exports.decodeXMLStrict = decodeXMLStrict;

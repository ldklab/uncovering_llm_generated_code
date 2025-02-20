"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const decode_js = require("./decode.js");
const encode_js = require("./encode.js");
const escape_js = require("./escape.js");

/** The level of entities to support. */
var EntityLevel = {
    XML: 0, // Support only XML entities.
    HTML: 1 // Support HTML entities.
};
exports.EntityLevel = EntityLevel;

var EncodingMode = {
    UTF8: 0, // Output is UTF-8, escaping only necessary XML characters.
    ASCII: 1, // Output is ASCII, escaping HTML and non-ASCII characters.
    Extensive: 2, // Encode all characters with entities and non-ASCII characters.
    Attribute: 3, // Encode characters for HTML attributes.
    Text: 4 // Encode characters for HTML text.
};
exports.EncodingMode = EncodingMode;

/**
 * Decodes a string with entities.
 * @param input String to decode.
 * @param options Decoding options.
 */
function decode(input, options = EntityLevel.XML) {
    const level = typeof options === "number" ? options : options.level;
    if (level === EntityLevel.HTML) {
        const mode = typeof options === "object" ? options.mode : undefined;
        return decode_js.decodeHTML(input, mode);
    }
    return decode_js.decodeXML(input);
}
exports.decode = decode;

/**
 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
 * @param input String to decode.
 * @param options Decoding options.
 * @deprecated Use `decode` with the `mode` set to `Strict`.
 */
function decodeStrict(input, options = EntityLevel.XML) {
    const normalizedOptions = typeof options === "number" ? { level: options } : options;
    normalizedOptions.mode = decode_js.DecodingMode.Strict;
    return decode(input, normalizedOptions);
}
exports.decodeStrict = decodeStrict;

/**
 * Encodes a string with entities.
 * @param input String to encode.
 * @param options Encoding options.
 */
function encode(input, options = EntityLevel.XML) {
    const { mode = EncodingMode.Extensive, level = EntityLevel.XML } = typeof options === "number" ? { level: options } : options;
    switch (mode) {
        case EncodingMode.UTF8:
            return escape_js.escapeUTF8(input);
        case EncodingMode.Attribute:
            return escape_js.escapeAttribute(input);
        case EncodingMode.Text:
            return escape_js.escapeText(input);
        default:
            if (level === EntityLevel.HTML) {
                return mode === EncodingMode.ASCII ? encode_js.encodeNonAsciiHTML(input) : encode_js.encodeHTML(input);
            }
            return escape_js.encodeXML(input);
    }
}
exports.encode = encode;

// Legacy aliases (deprecated)
exports.encodeHTML = encode_js.encodeHTML;
exports.encodeNonAsciiHTML = encode_js.encodeNonAsciiHTML;
exports.encodeHTML4 = encode_js.encodeHTML; // Alias for backward compatibility
exports.encodeHTML5 = encode_js.encodeHTML; // Alias for backward compatibility
exports.decodeXML = decode_js.decodeXML;
exports.decodeHTML = decode_js.decodeHTML;
exports.decodeHTMLStrict = decode_js.decodeHTMLStrict;
exports.decodeHTMLAttribute = decode_js.decodeHTMLAttribute;
exports.decodeHTML4 = decode_js.decodeHTML; // Alias for backward compatibility
exports.decodeHTML5 = decode_js.decodeHTML; // Alias for backward compatibility
exports.decodeHTML4Strict = decode_js.decodeHTMLStrict; // Alias for backward compatibility
exports.decodeHTML5Strict = decode_js.decodeHTMLStrict; // Alias for backward compatibility
exports.decodeXMLStrict = decode_js.decodeXML; // Alias for backward compatibility

// Additional exports
exports.EntityDecoder = decode_js.EntityDecoder;
exports.DecodingMode = decode_js.DecodingMode;
exports.encodeXML = escape_js.encodeXML;
exports.escapeUTF8 = escape_js.escapeUTF8;
exports.escapeAttribute = escape_js.escapeAttribute;
exports.escapeText = escape_js.escapeText;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeXMLStrict = exports.decodeHTML5Strict = exports.decodeHTML4Strict = exports.decodeHTML5 = exports.decodeHTML4 = exports.decodeHTMLStrict = exports.decodeHTML = exports.decodeXML = exports.encodeHTML5 = exports.encodeHTML4 = exports.escape = exports.encodeHTML = exports.encodeXML = exports.encode = exports.decodeStrict = exports.decode = void 0;

const { decodeXML, decodeHTML, decodeHTMLStrict } = require("./decode");
const { encodeXML, encodeHTML, escape } = require("./encode");

/**
 * Decodes a string with entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 */
function decode(data, level) {
    return (!level || level <= 0 ? decodeXML : decodeHTML)(data);
}
exports.decode = decode;

/**
 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 */
function decodeStrict(data, level) {
    return (!level || level <= 0 ? decodeXML : decodeHTMLStrict)(data);
}
exports.decodeStrict = decodeStrict;

/**
 * Encodes a string with entities.
 *
 * @param data String to encode.
 * @param level Optional level to encode at. 0 = XML, 1 = HTML. Default is 0.
 */
function encode(data, level) {
    return (!level || level <= 0 ? encodeXML : encodeHTML)(data);
}
exports.encode = encode;

// Re-export methods with the same names
exports.encodeXML = encodeXML;
exports.encodeHTML = encodeHTML;
exports.escape = escape;

// Legacy aliases for encoding
exports.encodeHTML4 = encodeHTML;
exports.encodeHTML5 = encodeHTML;

// Re-export methods for decoding
exports.decodeXML = decodeXML;
exports.decodeHTML = decodeHTML;
exports.decodeHTMLStrict = decodeHTMLStrict;

// Legacy aliases for decoding
exports.decodeHTML4 = decodeHTML;
exports.decodeHTML5 = decodeHTML;
exports.decodeHTML4Strict = decodeHTMLStrict;
exports.decodeHTML5Strict = decodeHTMLStrict;
exports.decodeXMLStrict = decodeXML;

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const { decodeXML, decodeHTML, decodeHTMLStrict } = require("./decode");
const { encodeXML, encodeHTML, escape } = require("./encode");

/**
 * Decodes a string with entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 */
function decode(data, level = 0) {
    return (level <= 0 ? decodeXML : decodeHTML)(data);
}
exports.decode = decode;

/**
 * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
 *
 * @param data String to decode.
 * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 */
function decodeStrict(data, level = 0) {
    return (level <= 0 ? decodeXML : decodeHTMLStrict)(data);
}
exports.decodeStrict = decodeStrict;

/**
 * Encodes a string with entities.
 *
 * @param data String to encode.
 * @param level Optional level to encode at. 0 = XML, 1 = HTML. Default is 0.
 */
function encode(data, level = 0) {
    return (level <= 0 ? encodeXML : encodeHTML)(data);
}
exports.encode = encode;

// Exports
exports.encodeXML = encodeXML;
exports.encodeHTML = encodeHTML;
exports.escape = escape;

// Legacy aliases
exports.encodeHTML4 = encodeHTML;
exports.encodeHTML5 = encodeHTML;
exports.decodeXML = decodeXML;
exports.decodeHTML = decodeHTML;
exports.decodeHTMLStrict = decodeHTMLStrict;
exports.decodeHTML4 = decodeHTML;
exports.decodeHTML5 = decodeHTML;
exports.decodeHTML4Strict = decodeHTMLStrict;
exports.decodeHTML5Strict = decodeHTMLStrict;
exports.decodeXMLStrict = decodeXML;

"use strict";

// Import the required functions from other modules
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

// Export other functions directly from the required modules
exports.encodeXML = encodeXML;
exports.encodeHTML = encodeHTML;
exports.escape = escape;

// Legacy aliases
exports.encodeHTML4 = encodeHTML;
exports.encodeHTML5 = encodeHTML;

// Export decode functions directly from the decode module
exports.decodeXML = decodeXML;
exports.decodeHTML = decodeHTML;

// Legacy aliases with strict decoding
exports.decodeHTML4 = decodeHTML;
exports.decodeHTML5 = decodeHTML;
exports.decodeHTML4Strict = decodeHTMLStrict;
exports.decodeHTML5Strict = decodeHTMLStrict;
exports.decodeXMLStrict = decodeXML;
exports.decodeHTMLStrict = decodeHTMLStrict;

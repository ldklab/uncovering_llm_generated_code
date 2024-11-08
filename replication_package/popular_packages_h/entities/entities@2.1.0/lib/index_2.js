"use strict";
const { decodeXML, decodeHTML, decodeHTMLStrict } = require("./decode");
const { encodeXML, encodeHTML, escape } = require("./encode");

/**
 * Decodes a string with entities.
 *
 * @param {string} data - String to decode.
 * @param {number} [level] - Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 * @returns {string} - Decoded string.
 */
function decode(data, level) {
    const decoder = (!level || level <= 0) ? decodeXML : decodeHTML;
    return decoder(data);
}

/**
 * Decodes a string with entities strictly.
 *
 * @param {string} data - String to decode.
 * @param {number} [level] - Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
 * @returns {string} - Decoded string.
 */
function decodeStrict(data, level) {
    const decoder = (!level || level <= 0) ? decodeXML : decodeHTMLStrict;
    return decoder(data);
}

/**
 * Encodes a string with entities.
 *
 * @param {string} data - String to encode.
 * @param {number} [level] - Optional level to encode at. 0 = XML, 1 = HTML. Default is 0.
 * @returns {string} - Encoded string.
 */
function encode(data, level) {
    const encoder = (!level || level <= 0) ? encodeXML : encodeHTML;
    return encoder(data);
}

exports.decode = decode;
exports.decodeStrict = decodeStrict;
exports.encode = encode;
exports.encodeXML = encodeXML;
exports.encodeHTML = encodeHTML;
exports.escape = escape;

// Legacy aliases for HTML encoding
exports.encodeHTML4 = encodeHTML;
exports.encodeHTML5 = encodeHTML;

// Decode exports with compatibility names
exports.decodeXML = decodeXML;
exports.decodeHTML = decodeHTML;
exports.decodeHTMLStrict = decodeHTMLStrict;
exports.decodeHTML4 = decodeHTML;
exports.decodeHTML5 = decodeHTML;
exports.decodeHTML4Strict = decodeHTMLStrict;
exports.decodeHTML5Strict = decodeHTMLStrict;
exports.decodeXMLStrict = decodeXML;

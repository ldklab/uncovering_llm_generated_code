'use strict';

const iconvLite = require('iconv-lite');

// Expose the convert function
module.exports.convert = convert;

/**
 * Convert the encoding of a string or buffer
 *
 * @param {String|Buffer} str - The string or buffer to convert
 * @param {String} to - The target encoding
 * @param {String} [from='UTF-8'] - The source encoding
 * @returns {Buffer} - The converted string as a buffer
 */
function convert(str, to, from = 'UTF-8') {
    from = normalizeEncoding(from);
    to = normalizeEncoding(to);
    str = str || '';

    let result;

    // Convert str to buffer if necessary
    if (from !== 'UTF-8' && typeof str === 'string') {
        str = Buffer.from(str, 'binary');
    }

    // If source and target encodings are the same, no conversion is needed
    if (from === to) {
        result = typeof str === 'string' ? Buffer.from(str) : str;
    } else {
        try {
            result = convertUsingIconvLite(str, to, from);
        } catch (error) {
            console.error(error);
            result = str;
        }
    }

    return typeof result === 'string' ? Buffer.from(result, 'utf-8') : result;
}

/**
 * Convert encoding using iconv-lite
 *
 * @param {String|Buffer} str - The string or buffer to convert
 * @param {String} to - The target encoding
 * @param {String} [from='UTF-8'] - The source encoding
 * @returns {Buffer} - The converted string as a buffer
 */
function convertUsingIconvLite(str, to, from) {
    if (to === 'UTF-8') {
        return iconvLite.decode(str, from);
    } else if (from === 'UTF-8') {
        return iconvLite.encode(str, to);
    } else {
        return iconvLite.encode(iconvLite.decode(str, from), to);
    }
}

/**
 * Normalize encoding names
 *
 * @param {String} name - The encoding name
 * @returns {String} - The normalized encoding name
 */
function normalizeEncoding(name) {
    return (name || '')
        .toString()
        .trim()
        .replace(/^latin[\-_]?(\d+)$/i, 'ISO-8859-$1')
        .replace(/^win(?:dows)?[\-_]?(\d+)$/i, 'WINDOWS-$1')
        .replace(/^utf[\-_]?(\d+)$/i, 'UTF-$1')
        .replace(/^ks_c_5601\-1987$/i, 'CP949')
        .replace(/^us[\-_]?ascii$/i, 'ASCII')
        .toUpperCase();
}

'use strict';

const iconvLite = require('iconv-lite');

// Expose the convert function
module.exports.convert = convert;

/**
 * Convert the encoding of a UTF-8 string or a buffer.
 *
 * @param {String|Buffer} str - String to be converted.
 * @param {String} to - Encoding to be converted to.
 * @param {String} [from='UTF-8'] - Encoding to be converted from.
 * @returns {Buffer} - Encoded string.
 */
function convert(str, to, from) {
    from = ensureEncoding(from || 'UTF-8');
    to = ensureEncoding(to || 'UTF-8');
    str = str || '';

    let result;

    if (from !== 'UTF-8' && typeof str === 'string') {
        str = Buffer.from(str, 'binary');
    }

    if (from === to) {
        result = typeof str === 'string' ? Buffer.from(str) : str;
    } else {
        try {
            result = performIconvLiteConversion(str, to, from);
        } catch (error) {
            console.error(error);
            result = str;
        }
    }

    if (typeof result === 'string') {
        result = Buffer.from(result, 'utf-8');
    }

    return result;
}

/**
 * Convert encoding using iconv-lite.
 *
 * @param {String|Buffer} str - String to be converted.
 * @param {String} to - Encoding to be converted to.
 * @param {String} from - Encoding to be converted from.
 * @returns {Buffer} - Encoded string.
 */
function performIconvLiteConversion(str, to, from) {
    if (to === 'UTF-8') {
        return iconvLite.decode(str, from);
    } else if (from === 'UTF-8') {
        return iconvLite.encode(str, to);
    } else {
        return iconvLite.encode(iconvLite.decode(str, from), to);
    }
}

/**
 * Normalize encoding name.
 *
 * @param {String} name - Character set.
 * @returns {String} - Normalized character set name.
 */
function ensureEncoding(name) {
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

'use strict';

const iconvLite = require('iconv-lite');

// Export convert function
module.exports.convert = convert;

/**
 * Convert encoding of a UTF-8 string or a buffer
 *
 * @param {String|Buffer} str String or buffer to convert
 * @param {String} to Target encoding
 * @param {String} [from='UTF-8'] Source encoding
 * @return {Buffer} Converted buffer
 */
function convert(str, to, from = 'UTF-8') {
    from = normalizeEncoding(from);
    to = normalizeEncoding(to);
    str = str || '';

    if (from !== 'UTF-8' && typeof str === 'string') {
        str = Buffer.from(str, 'binary');
    }

    let result;
    if (from === to) {
        result = Buffer.isBuffer(str) ? str : Buffer.from(str);
    } else {
        try {
            result = convertUsingIconvLite(str, to, from);
        } catch (error) {
            console.error(error);
            result = Buffer.isBuffer(str) ? str : Buffer.from(str);
        }
    }

    if (typeof result === 'string') {
        result = Buffer.from(result, 'utf-8');
    }

    return result;
}

/**
 * Convert encoding using iconv-lite
 *
 * @param {String|Buffer} str String or buffer to convert
 * @param {String} to Target encoding
 * @param {String} from Source encoding
 * @return {Buffer|String} Converted value
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
 * Normalize encoding names to a standard format
 *
 * @param {String} name Character set name
 * @return {String} Standardized character set name
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

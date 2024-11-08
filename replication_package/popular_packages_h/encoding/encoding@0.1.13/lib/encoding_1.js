'use strict';

const iconvLite = require('iconv-lite');

// Export convert function
module.exports.convert = convert;

/**
 * Convert encoding of a UTF-8 string or a buffer
 *
 * @param {String|Buffer} input Input string or buffer to be converted
 * @param {String} targetEncoding Target encoding type
 * @param {String} [sourceEncoding='UTF-8'] Source encoding type
 * @return {Buffer} Converted Buffer with specified encoding
 */
function convert(input, targetEncoding, sourceEncoding = 'UTF-8') {
    sourceEncoding = normalizeEncoding(sourceEncoding);
    targetEncoding = normalizeEncoding(targetEncoding);
    input = input || '';

    let result;

    if (sourceEncoding !== 'UTF-8' && typeof input === 'string') {
        input = Buffer.from(input, 'binary');
    }

    if (sourceEncoding === targetEncoding) {
        result = typeof input === 'string' ? Buffer.from(input) : input;
    } else {
        try {
            result = useIconvLiteForConversion(input, targetEncoding, sourceEncoding);
        } catch (error) {
            console.error(error);
            result = input;
        }
    }

    return Buffer.isBuffer(result) ? result : Buffer.from(result, 'utf-8');
}

/**
 * Use iconv-lite to convert string or buffer
 *
 * @param {String|Buffer} input Input data for conversion
 * @param {String} to Target encoding
 * @param {String} from Source encoding
 * @return {Buffer} Converted data as a buffer
 */
function useIconvLiteForConversion(input, to, from) {
    if (to === 'UTF-8') {
        return iconvLite.decode(input, from);
    } else if (from === 'UTF-8') {
        return iconvLite.encode(input, to);
    } else {
        return iconvLite.encode(iconvLite.decode(input, from), to);
    }
}

/**
 * Normalize and standardize character encoding names
 *
 * @param {String} name Name of the encoding
 * @return {String} Normalized encoding name
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

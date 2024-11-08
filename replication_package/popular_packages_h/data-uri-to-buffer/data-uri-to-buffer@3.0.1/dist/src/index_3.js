"use strict";

/**
 * Converts a data URI to a Buffer instance.
 *
 * @param {string} uri The data URI to be converted
 * @return {Buffer} The resulting Buffer instance
 * @api public
 */
function dataUriToBuffer(uri) {
    if (!/^data:/i.test(uri)) {
        throw new TypeError('The input does not start with "data:", thus it is not a valid Data URI.');
    }

    // Remove newline characters from the URI
    uri = uri.replace(/\r?\n/g, '');

    // Find the first comma to split metadata and data
    const firstCommaIndex = uri.indexOf(',');
    if (firstCommaIndex === -1 || firstCommaIndex <= 4) {
        throw new TypeError('The data URI is malformed.');
    }

    // Extract metadata and data portions
    const meta = uri.slice(5, firstCommaIndex).split(';');
    const type = meta[0] || 'text/plain';
    let typeFull = type;
    let charset = '';
    let isBase64 = false;

    // Parse metadata to determine encoding type and charset
    for (let i = 1; i < meta.length; i++) {
        if (meta[i] === 'base64') {
            isBase64 = true;
        } else {
            typeFull += `;${meta[i]}`;
            if (meta[i].startsWith('charset=')) {
                charset = meta[i].slice(8);
            }
        }
    }

    // Default values when type is not defined
    if (!meta[0] && !charset) {
        charset = 'US-ASCII';
        typeFull += `;charset=${charset}`;
    }

    // Decode the data portion
    const dataEncoding = isBase64 ? 'base64' : 'ascii';
    const data = decodeURIComponent(uri.slice(firstCommaIndex + 1));
    const buffer = Buffer.from(data, dataEncoding);

    // Add additional info to the buffer object
    buffer.type = type;
    buffer.typeFull = typeFull;
    buffer.charset = charset;

    return buffer;
}

module.exports = dataUriToBuffer;

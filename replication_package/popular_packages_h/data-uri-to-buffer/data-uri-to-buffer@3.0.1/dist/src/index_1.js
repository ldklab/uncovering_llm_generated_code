"use strict";

/**
 * Converts a Data URI to a Buffer instance.
 *
 * @param {String} uri - The Data URI.
 * @returns {Buffer} - Buffer constructed from the Data URI.
 * @throws {TypeError} - If the URI is not a valid Data URI.
 * @api public
 */
function dataUriToBuffer(uri) {
    // Ensure the URI starts with 'data:'
    if (!/^data:/i.test(uri)) {
        throw new TypeError('`uri` must start with "data:" to be a valid Data URI');
    }

    // Remove any newlines in the URI
    uri = uri.replace(/\r?\n/g, '');

    // Split URI into metadata and data parts
    const firstComma = uri.indexOf(',');
    if (firstComma === -1 || firstComma <= 4) {
        throw new TypeError('malformed data: URI');
    }

    const meta = uri.substring(5, firstComma).split(';');
    let charset = '';
    let base64 = false;
    const type = meta[0] || 'text/plain';
    let typeFull = type;

    // Process additional metadata
    for (let i = 1; i < meta.length; i++) {
        if (meta[i] === 'base64') {
            base64 = true;
        } else {
            typeFull += `;${meta[i]}`;
            if (meta[i].startsWith('charset=')) {
                charset = meta[i].substring(8);
            }
        }
    }

    // Default to US-ASCII charset if none is specified
    if (!meta[0] && !charset) {
        typeFull += ';charset=US-ASCII';
        charset = 'US-ASCII';
    }

    // Decode the data portion
    const encoding = base64 ? 'base64' : 'ascii';
    const data = unescape(uri.substring(firstComma + 1));
    const buffer = Buffer.from(data, encoding);

    // Attach metadata properties to the Buffer
    buffer.type = type;
    buffer.typeFull = typeFull;
    buffer.charset = charset;

    return buffer;
}

module.exports = dataUriToBuffer;

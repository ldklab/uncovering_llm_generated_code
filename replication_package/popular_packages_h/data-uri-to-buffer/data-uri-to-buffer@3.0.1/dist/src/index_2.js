"use strict";

/**
 * Converts a Data URI to a Buffer instance.
 * 
 * @param {String} uri - The Data URI to convert.
 * @returns {Buffer} - A Buffer instance containing the data from the Data URI.
 * @throws {TypeError} - If the URI is not a valid Data URI.
 */
function dataUriToBuffer(uri) {
    if (!/^data:/i.test(uri)) {
        throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
    }

    // Remove newlines from the URI
    uri = uri.replace(/\r?\n/g, '');

    // Find the first comma to separate metadata and data
    const firstComma = uri.indexOf(',');
    if (firstComma === -1 || firstComma <= 4) {
        throw new TypeError('malformed data: URI');
    }

    // Extract metadata
    const meta = uri.substring(5, firstComma).split(';');
    let base64 = false;
    let charset = '';
    const type = meta[0] || 'text/plain';
    let typeFull = type;

    // Parse metadata for charset and encoding type
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

    // Set default charset if not provided
    if (!meta[0] && !charset) {
        typeFull += ';charset=US-ASCII';
        charset = 'US-ASCII';
    }

    // Decode the data part of the URI
    const encoding = base64 ? 'base64' : 'ascii';
    const data = unescape(uri.substring(firstComma + 1));
    const buffer = Buffer.from(data, encoding);

    // Add additional properties to the buffer
    buffer.type = type;
    buffer.typeFull = typeFull;
    buffer.charset = charset;

    return buffer;
}

module.exports = dataUriToBuffer;

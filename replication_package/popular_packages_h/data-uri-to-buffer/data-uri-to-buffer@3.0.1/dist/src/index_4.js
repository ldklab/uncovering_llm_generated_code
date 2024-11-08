"use strict";

/**
 * Converts a Data URI to a Buffer instance.
 *
 * @param {String} uri - The Data URI to convert.
 * @returns {Buffer} - A Buffer instance representing the data from the Data URI.
 * @throws {TypeError} - If the input is not a valid Data URI.
 */
function dataUriToBuffer(uri) {
    if (!/^data:/i.test(uri)) {
        throw new TypeError('`uri` does not appear to be a Data URI (must begin with "data:")');
    }
    
    // Remove newlines for consistency
    uri = uri.replace(/\r?\n/g, '');
    
    // Find the first comma separating metadata from data
    const firstComma = uri.indexOf(',');
    if (firstComma === -1 || firstComma <= 4) {
        throw new TypeError('malformed data: URI');
    }

    // Extract metadata
    const meta = uri.substring(5, firstComma).split(';');
    let charset = '';
    let base64 = false;
    const type = meta[0] || 'text/plain';
    let typeFull = type;

    // Parse metadata for base64 encoding and charset
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

    // Default to US-ASCII charset if unspecified
    if (!meta[0] && !charset) {
        typeFull += ';charset=US-ASCII';
        charset = 'US-ASCII';
    }

    // Extract data and create Buffer
    const encoding = base64 ? 'base64' : 'ascii';
    const data = decodeURIComponent(uri.slice(firstComma + 1));
    const buffer = Buffer.from(data, encoding);

    // Assign MIME type and charset to buffer properties
    buffer.type = type;
    buffer.typeFull = typeFull;
    buffer.charset = charset;

    return buffer;
}

module.exports = dataUriToBuffer;

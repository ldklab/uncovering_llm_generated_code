const { Readable } = require("stream");

/**
 * Calculates the length of a given request body.
 *
 * @param {any} body - The request body for which to calculate the length.
 * @returns {number|null} - The computed length of the body, or null if calculation is not possible.
 */
function getBodyLength(body) {
    // Check for null or undefined bodies
    if (body === null || body === undefined) {
        return 0;
    }

    // Calculate byte length for strings
    if (typeof body === "string") {
        return Buffer.byteLength(body, 'utf-8');
    }

    // Return length of Buffer object
    if (Buffer.isBuffer(body)) {
        return body.length;
    }

    // Evaluate byte length for typed arrays (e.g., Uint8Array)
    if (ArrayBuffer.isView(body)) {
        return body.byteLength;
    }

    // Check if the body is an ArrayBuffer
    if (body instanceof ArrayBuffer) {
        return body.byteLength;
    }

    // Check if the body is an object with a numerical length property
    if (typeof body === "object" && typeof body.length === "number") {
        return body.length;
    }

    // Return null for stream objects as length cannot be determined
    if (body instanceof Readable) {
        return null;
    }

    // Default return null for unsupported body types
    return null;
}

module.exports = { getBodyLength };

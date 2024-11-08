// This module is responsible for determining the length of a request body in Node.js. 
// It handles various types of input, such as strings, Buffers, ArrayBuffers, and streams.

const { Readable } = require("stream");

/**
 * Function to determine the length of a given request body.
 *
 * @param {any} body - The request body whose length is to be calculated.
 * @returns {number|null} - Returns the length of the body if calculable, or null if not.
 */
function getBodyLength(body) {
    // Return length 0 for null or undefined bodies
    if (body === null || body === undefined) {
        return 0;
    }

    // For string bodies, determine length using Buffer.byteLength for UTF-8 encoding
    if (typeof body === "string") {
        return Buffer.byteLength(body, 'utf-8');
    }

    // For Buffer type bodies, return the buffer's length
    if (Buffer.isBuffer(body)) {
        return body.length;
    }

    // For typed arrays, like Uint8Array, return their byte length
    if (ArrayBuffer.isView(body)) {
        return body.byteLength;
    }

    // For plain ArrayBuffer objects, return their byte length
    if (body instanceof ArrayBuffer) {
        return body.byteLength;
    }

    // For objects with a numeric length property, return the length value
    if (typeof body === "object" && typeof body.length === "number") {
        return body.length;
    }

    // Return null for stream bodies as their length cannot be predetermined without reading
    if (body instanceof Readable) {
        return null;
    }

    // For all other cases, return null indicating undetermined length
    return null;
}

module.exports = { getBodyLength };

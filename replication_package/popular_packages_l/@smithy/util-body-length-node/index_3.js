const { Readable } = require("stream");

/**
 * Determines the length of a request body.
 *
 * @param {any} body - The request body whose length needs to be determined.
 * @returns {number|null} - The length of the body, or null if it cannot be determined.
 */
function getBodyLength(body) {
    if (body == null) {
        return 0; // Return 0 for null or undefined
    }

    if (typeof body === "string") {
        return Buffer.byteLength(body, 'utf-8');
    }

    if (Buffer.isBuffer(body)) {
        return body.length;
    }

    if (ArrayBuffer.isView(body) || body instanceof ArrayBuffer) {
        return body.byteLength; // Covers TypedArray and ArrayBuffer cases
    }

    if (typeof body === "object" && typeof body.length === "number") {
        return body.length; // Handles objects with a numeric length property
    }

    if (body instanceof Readable) {
        return null; // Return null for streams as length is indeterminable
    }

    return null; // Default to null if no conditions are met
}

module.exports = { getBodyLength };

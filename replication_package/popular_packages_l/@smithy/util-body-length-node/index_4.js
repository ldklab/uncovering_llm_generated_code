const { Readable } = require("stream");

/**
 * Determines the length of a request body.
 *
 * @param {any} body - The request body whose length to be determined.
 * @returns {number|null} - The length of the body, or null if undetermined.
 */
function getBodyLength(body) {
    if (body === null || body === undefined) {
        return 0;
    }

    if (typeof body === "string") {
        return Buffer.byteLength(body, 'utf-8');
    }

    if (Buffer.isBuffer(body)) {
        return body.length;
    }

    if (ArrayBuffer.isView(body)) {
        return body.byteLength;
    }

    if (body instanceof ArrayBuffer) {
        return body.byteLength;
    }

    if (typeof body === "object" && typeof body.length === "number") {
        return body.length;
    }

    if (body instanceof Readable) {
        return null;
    }

    return null;
}

module.exports = { getBodyLength };

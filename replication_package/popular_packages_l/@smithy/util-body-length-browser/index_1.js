// @smithy/util-body-length-browser

/**
 * Calculate the length of the request body.
 *
 * @param {any} body - The request body whose length is to be determined.
 * @returns {number|null} - Returns the length of the body if calculable, otherwise null.
 */
function calculateBodyLength(body) {
  if (body === null || body === undefined) {
    return 0;
  }

  if (typeof body === 'string') {
    return body.length;
  }

  if (body instanceof Blob || Buffer.isBuffer(body)) {
    return body.size || body.length;
  }

  if (body instanceof ArrayBuffer || ArrayBuffer.isView(body)) {
    return body.byteLength;
  }

  return null;
}

module.exports = { calculateBodyLength };

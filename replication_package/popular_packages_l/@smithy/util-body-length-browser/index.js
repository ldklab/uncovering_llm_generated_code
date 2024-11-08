// @smithy/util-body-length-browser

/**
 * Calculate the length of the request body.
 *
 * @param {any} body - The request body whose length is to be determined.
 * @returns {number|null} - Returns the length of the body if calculable, otherwise null.
 */
function getLength(body) {
  if (body === null || body === undefined) {
    return 0;
  }

  if (typeof body === "string") {
    return body.length;
  }

  // Support for Blob or File in a browser
  if (body instanceof Blob) {
    return body.size;
  }

  // Support for Buffer
  if (Buffer.isBuffer(body)) {
    return body.length;
  }

  // Support for ArrayBuffer
  if (body instanceof ArrayBuffer) {
    return body.byteLength;
  }

  // Support for TypedArray (Uint8Array, etc.)
  if (ArrayBuffer.isView(body)) {
    return body.byteLength;
  }

  // If body is a Stream or any other type which length is not determinable, return null
  return null;
}

module.exports = { getLength };

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

  if (body instanceof Blob || body instanceof File) {
    return body.size;
  }

  if (Buffer.isBuffer(body)) {
    return body.length;
  }

  if (body instanceof ArrayBuffer) {
    return body.byteLength;
  }

  if (ArrayBuffer.isView(body)) {
    return body.byteLength;
  }

  return null;
}

module.exports = { getLength };

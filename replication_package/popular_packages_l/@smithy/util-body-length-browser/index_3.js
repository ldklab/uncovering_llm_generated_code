/**
 * Calculate and return the length of the request body.
 * 
 * @param {any} body - The request body whose length is to be calculated.
 * @returns {number|null} - Returns the length of the body if calculable; otherwise, returns null.
 */
function getLength(body) {
  if (body === null || body === undefined) {
    return 0; // Return 0 for null or undefined inputs
  }

  if (typeof body === "string") {
    return body.length; // Return the length for string inputs
  }

  if (body instanceof Blob) {
    return body.size; // Return the size for Blob inputs in a browser environment
  }

  if (Buffer.isBuffer(body)) {
    return body.length; // Return the length for Buffer inputs
  }

  if (body instanceof ArrayBuffer) {
    return body.byteLength; // Return the byteLength for ArrayBuffer inputs
  }

  if (ArrayBuffer.isView(body)) {
    return body.byteLength; // Return the byteLength for TypedArray views (e.g., Uint8Array)
  }

  return null; // Return null for streams or other types where length can't be determined
}

module.exports = { getLength };

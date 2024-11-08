// jwt-decode.js

/**
 * A function to decode Base64Url encoded strings which are typically used in JWTs (JSON Web Tokens).
 * It replaces characters and adds necessary padding to make the string a valid Base64 format and decodes it.
 * 
 * @param {string} str - The Base64Url encoded string.
 * @returns {string} - The decoded string.
 */
function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const base64WithPadding = base64 + padding;
  return Buffer.from(base64WithPadding, 'base64').toString();
}

/**
 * A function that decodes the payload or header part of a JWT.
 * Throws an error if the token is invalid, not a string, or if the JSON structure is corrupted.
 * 
 * @param {string} token - The JWT token to decode.
 * @param {Object} options - Options object to specify if the header should be decoded.
 * @param {boolean} options.header - If true, decode the header instead of the payload.
 * @returns {Object} - The decoded JSON object.
 */
function jwtDecode(token, options = {}) {
  if (typeof token !== 'string') {
    throw new Error('Invalid token specified: must be a string');
  }

  const [headerSegment, payloadSegment, signatureSegment] = token.split('.');

  if (!headerSegment || !payloadSegment || !signatureSegment) {
    throw new Error('Invalid token specified: missing part #');
  }

  try {
    // Decode the JWT header if the "header" option is true; otherwise, decode the payload.
    const segmentToDecode = options.header ? headerSegment : payloadSegment;
    const decoded = base64UrlDecode(segmentToDecode);
    return JSON.parse(decoded);  
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error('Invalid token specified: invalid json for part #');
    } else {
      throw new Error('Invalid token specified: invalid base64 for part #');
    }
  }
}

// Exporting the function to be used in other modules.
module.exports = { jwtDecode };

// Example Usage:

// The following lines show how to use the jwtDecode function in both CommonJS and ES6 module syntax.
// Uncomment the respective import statement based on your project’s module system.

// For CommonJS:
// const { jwtDecode } = require('./jwt-decode');

// For ES6:
// import { jwtDecode } from './jwt-decode';

// Sample Usage to Demonstrate Decoding a JWT:
try {
  // A sample JWT token as a string.
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJleHAiOjEzOTMyODY4OTMsImlhdCI6MTM5MjY4ODkz.f_SyLNkF5H7gTxDbDeihdj5Z8SGvt-jvE4H14RJC2u0";
  
  // Decoding the payload part of the JWT.
  const decoded = jwtDecode(token);
  console.log(decoded);

  // Decoding the header part of the JWT by setting the header option to true.
  const decodedHeader = jwtDecode(token, { header: true });
  console.log(decodedHeader);
} catch (error) {
  console.error(error.message);
}

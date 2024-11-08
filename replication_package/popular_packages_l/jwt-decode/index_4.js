// jwt-decode.js

function base64UrlDecode(input) {
  // Converts the base64url string into a base64 string by replacing non-base64 symbols
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  // Adds necessary padding to make the base64 length a multiple of 4
  const paddedBase64 = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  // Decodes the base64 string into a UTF-8 string
  return Buffer.from(paddedBase64, 'base64').toString();
}

function jwtDecode(token, options = {}) {
  if (typeof token !== 'string') {
    throw new Error('Invalid token specified: must be a string');
  }

  // Splits the token into its base64url-encoded components
  const [headerSegment, payloadSegment, signatureSegment] = token.split('.');

  if (!headerSegment || !payloadSegment || !signatureSegment) {
    throw new Error('Invalid token specified: missing part #');
  }

  try {
    // Determines which part of the token to decode based on the options provided
    const segmentToDecode = options.header ? headerSegment : payloadSegment;
    // Decodes the specified segment and parses it as JSON
    const decoded = base64UrlDecode(segmentToDecode);
    return JSON.parse(decoded);  
  } catch (err) {
    // Identifies the type of error: either invalid JSON or base64-decoding error
    if (err instanceof SyntaxError) {
      throw new Error('Invalid token specified: invalid JSON for part #');
    } else {
      throw new Error('Invalid token specified: invalid base64 for part #');
    }
  }
}

module.exports = { jwtDecode };

// Usage in CommonJS environment:
// const { jwtDecode } = require('./jwt-decode');

// Usage in ES6 environment:
// import { jwtDecode } from './jwt-decode';

// Sample usage demonstration
try {
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJleHAiOjEzOTMyODY4OTMsImlhdCI6MTM5MjY4ODkz.f_SyLNkF5H7gTxDbDeihdj5Z8SGvt-jvE4H14RJC2u0";
  // Decodes the payload part of the JWT
  const decoded = jwtDecode(token);
  console.log(decoded);

  // Decodes the header part of the JWT
  const decodedHeader = jwtDecode(token, { header: true });
  console.log(decodedHeader);
} catch (error) {
  console.error(error.message);
}

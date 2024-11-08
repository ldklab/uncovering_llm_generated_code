// jwt-decode.js

function base64UrlDecode(str) {
  // Converts Base64 URL safe string to a standard Base64 string
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  
  // Adds padding if necessary
  const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const base64WithPadding = base64 + padding;
  
  // Decodes the Base64 string using Buffer
  return Buffer.from(base64WithPadding, 'base64').toString();
}

function jwtDecode(token, options = {}) {
  // Validates the token is a string
  if (typeof token !== 'string') {
    throw new Error('Invalid token specified: must be a string');
  }
  
  // Splits the token into its base components
  const [headerSegment, payloadSegment, signatureSegment] = token.split('.');

  // Checks for the presence of all necessary parts
  if (!headerSegment || !payloadSegment || !signatureSegment) {
    throw new Error(`Invalid token specified: missing part #`);
  }

  try {
    // Decides which part to decode
    const segmentToDecode = options.header ? headerSegment : payloadSegment;
    const decoded = base64UrlDecode(segmentToDecode);

    // Tries parsing the decoded string as JSON
    return JSON.parse(decoded);
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new Error(`Invalid token specified: invalid json for part #`);
    } else {
      throw new Error(`Invalid token specified: invalid base64 for part #`);
    }
  }
}

module.exports = { jwtDecode };

// Usage in CommonJS:
// const { jwtDecode } = require('./jwt-decode');

// Usage in ES6:
// import { jwtDecode } from './jwt-decode';

// Sample Usage
try {
  // Example JWT token
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJleHAiOjEzOTMyODY4OTMsImlhdCI6MTM5MjY4ODkz.f_SyLNkF5H7gTxDbDeihdj5Z8SGvt-jvE4H14RJC2u0";
  
  // Decoding the payload
  const decoded = jwtDecode(token);
  console.log(decoded);

  // Decoding the header by setting options.header = true
  const decodedHeader = jwtDecode(token, { header: true });
  console.log(decodedHeader);
  
} catch (error) {
  console.error(error.message);
}

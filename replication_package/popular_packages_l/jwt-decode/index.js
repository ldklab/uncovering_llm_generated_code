// jwt-decode.js

function base64UrlDecode(str) {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const base64WithPadding = base64 + padding;
  return Buffer.from(base64WithPadding, 'base64').toString();
}

function jwtDecode(token, options = {}) {
  if (typeof token !== 'string') {
    throw new Error('Invalid token specified: must be a string');
  }

  const [headerSegment, payloadSegment, signatureSegment] = token.split('.');

  if (!headerSegment || !payloadSegment || !signatureSegment) {
    throw new Error(`Invalid token specified: missing part #`);
  }

  try {
    const segmentToDecode = options.header ? headerSegment : payloadSegment;
    const decoded = base64UrlDecode(segmentToDecode);
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
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJleHAiOjEzOTMyODY4OTMsImlhdCI6MTM5MjY4ODkz.f_SyLNkF5H7gTxDbDeihdj5Z8SGvt-jvE4H14RJC2u0";
  const decoded = jwtDecode(token);
  console.log(decoded);

  const decodedHeader = jwtDecode(token, { header: true });
  console.log(decodedHeader);
} catch (error) {
  console.error(error.message);
}

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

  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new Error(`Invalid token specified: missing part #`);
  }
  
  const [headerSegment, payloadSegment] = segments;

  const segmentToDecode = options.header ? headerSegment : payloadSegment;
  const decoded = base64UrlDecode(segmentToDecode);

  try {
    return JSON.parse(decoded);
  } catch (err) {
    const errorType = err instanceof SyntaxError ? 'invalid json' : 'invalid base64';
    throw new Error(`Invalid token specified: ${errorType} for part #`);
  }
}

module.exports = { jwtDecode };

// Sample Usage
try {
  const token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJleHAiOjEzOTMyODY4OTMsImlhdCI6MTM5MjY4ODkz.f_SyLNkF5H7gTxDbDeihdj5Z8SGvt-jvE4H14RJC2u0";
  console.log(jwtDecode(token)); // Decode payload
  console.log(jwtDecode(token, { header: true })); // Decode header
} catch (error) {
  console.error(error.message);
}

// html-encoding-sniffer.js
const supportedEncodings = require("whatwg-encoding");

// Detect BOM
function detectBOM(bytes) {
  if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
    return "UTF-8";
  }
  if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
    return "UTF-16BE";
  }
  if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
    return "UTF-16LE";
  }
  return null;
}

// Search for <meta charset>
function searchMetaCharset(bytes) {
  const str = bytes.toString('binary', 0, 1024).toLowerCase();
  const metaTag = /<meta\s+[^>]*charset\s*=\s*["']?([^"';\s]*)/i;
  const match = str.match(metaTag);
  if (match && match[1]) return match[1];
  return null;
}

// The encoding sniffer function
function htmlEncodingSniffer(htmlBytes, options = {}) {
  const transportLayerEncodingLabel = options.transportLayerEncodingLabel;
  const defaultEncoding = options.defaultEncoding || "windows-1252";

  // Check BOM
  let encoding = detectBOM(htmlBytes);
  if (encoding) return supportedEncodings.labelToName(encoding);

  // Check <meta charset>
  encoding = searchMetaCharset(htmlBytes);
  if (encoding) return supportedEncodings.labelToName(encoding);

  // Use transport layer encoding label
  if (transportLayerEncodingLabel) {
    encoding = supportedEncodings.labelToName(transportLayerEncodingLabel);
    if (encoding) return encoding;
  }

  // Default to "windows-1252"
  return supportedEncodings.labelToName(defaultEncoding);
}

module.exports = htmlEncodingSniffer;

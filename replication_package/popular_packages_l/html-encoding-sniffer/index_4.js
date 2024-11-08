// html-encoding-sniffer.js
const supportedEncodings = require("whatwg-encoding");

// Function to detect Byte Order Mark (BOM)
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

// Function to search for <meta charset>
function searchMetaCharset(bytes) {
  const content = bytes.toString('binary', 0, 1024).toLowerCase();
  const metaCharsetRegex = /<meta\s+[^>]*charset\s*=\s*["']?([^"';\s]*)/i;
  const found = content.match(metaCharsetRegex);
  return found && found[1] ? found[1] : null;
}

// Function to determine HTML document encoding
function htmlEncodingSniffer(htmlBytes, options = {}) {
  const { transportLayerEncodingLabel = null, defaultEncoding = "windows-1252" } = options;

  // Check BOM
  let encoding = detectBOM(htmlBytes);
  if (encoding) return supportedEncodings.labelToName(encoding);

  // Check <meta charset>
  encoding = searchMetaCharset(htmlBytes);
  if (encoding) return supportedEncodings.labelToName(encoding);

  // Use encoding provided by the transport layer
  if (transportLayerEncodingLabel) {
    encoding = supportedEncodings.labelToName(transportLayerEncodingLabel);
    if (encoding) return encoding;
  }

  // Return default encoding
  return supportedEncodings.labelToName(defaultEncoding);
}

module.exports = htmlEncodingSniffer;

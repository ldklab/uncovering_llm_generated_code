const supportedEncodings = require("whatwg-encoding");

function detectBOM(bytes) {
  const bomSignatures = {
    UTF_8: [0xEF, 0xBB, 0xBF],
    UTF_16BE: [0xFE, 0xFF],
    UTF_16LE: [0xFF, 0xFE]
  };

  if (bytes.slice(0, 3).toString("hex") === bomSignatures.UTF_8.map(byte => byte.toString(16)).join('')) {
    return "UTF-8";
  }
  if (bytes.slice(0, 2).toString("hex") === bomSignatures.UTF_16BE.map(byte => byte.toString(16)).join('')) {
    return "UTF-16BE";
  }
  if (bytes.slice(0, 2).toString("hex") === bomSignatures.UTF_16LE.map(byte => byte.toString(16)).join('')) {
    return "UTF-16LE";
  }
  return null;
}

function searchMetaCharset(bytes) {
  const str = bytes.toString('binary', 0, 1024).toLowerCase();
  const metaCharsetPattern = /<meta\s+[^>]*charset\s*=\s*["']?([^"';\s]*)/i;
  const match = metaCharsetPattern.exec(str);
  return match ? match[1] : null;
}

function htmlEncodingSniffer(htmlBytes, options = {}) {
  const { transportLayerEncodingLabel, defaultEncoding = "windows-1252" } = options;

  let encoding = detectBOM(htmlBytes);
  if (encoding) {
    return supportedEncodings.labelToName(encoding);
  }

  encoding = searchMetaCharset(htmlBytes);
  if (encoding) {
    return supportedEncodings.labelToName(encoding);
  }

  if (transportLayerEncodingLabel) {
    encoding = supportedEncodings.labelToName(transportLayerEncodingLabel);
    if (encoding) {
      return encoding;
    }
  }

  return supportedEncodings.labelToName(defaultEncoding);
}

module.exports = htmlEncodingSniffer;

"use strict";
const iconvLite = require("iconv-lite");
const supportedNames = require("./supported-names.json");
const labelsToNames = require("./labels-to-names.json");

const supportedNamesSet = new Set(supportedNames);

// Convert a label to a standardized encoding name
exports.labelToName = (label) => {
  label = String(label).trim().toLowerCase();
  return labelsToNames[label] || null;
};

// Decode a buffer using the specified encoding or BOM-determined encoding
exports.decode = (buffer, fallbackEncodingName) => {
  let encoding = exports.getBOMEncoding(buffer) || fallbackEncodingName;
  
  if (!exports.isSupported(encoding)) {
    throw new RangeError(`"${encoding}" is not a supported encoding name`);
  }

  return iconvLite.decode(buffer, encoding);
};

// Detect the encoding from BOM in the buffer
exports.getBOMEncoding = (buffer) => {
  if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
    return "UTF-16BE";
  }
  if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return "UTF-16LE";
  }
  if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return "UTF-8";
  }
  return null;
};

// Check if the encoding name is supported
exports.isSupported = (name) => {
  return supportedNamesSet.has(String(name));
};

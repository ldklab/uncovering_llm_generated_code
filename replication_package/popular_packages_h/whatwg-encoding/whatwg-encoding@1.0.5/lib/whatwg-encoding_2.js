"use strict";
const iconvLite = require("iconv-lite");
const supportedNames = require("./supported-names.json");
const labelsToNames = require("./labels-to-names.json");

const supportedNamesSet = new Set(supportedNames);

// Converts a label to its canonical encoding name
exports.labelToName = (label) => {
  label = String(label).trim().toLowerCase();
  return labelsToNames[label] || null;
};

// Decodes a buffer with a specified or detected encoding
exports.decode = (buffer, fallbackEncodingName) => {
  let encoding = fallbackEncodingName;

  if (!exports.isSupported(encoding)) {
    throw new RangeError(`"${encoding}" is not a supported encoding name`);
  }

  const bomEncoding = exports.getBOMEncoding(buffer);
  if (bomEncoding !== null) {
    encoding = bomEncoding;
  }

  return iconvLite.decode(buffer, encoding);
};

// Detects encoding from BOM in the buffer
exports.getBOMEncoding = (buffer) => {
  if (buffer[0] === 0xFE && buffer[1] === 0xFF) {
    return "UTF-16BE";
  } else if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
    return "UTF-16LE";
  } else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    return "UTF-8";
  }

  return null;
};

// Checks if an encoding name is supported
exports.isSupported = (name) => {
  return supportedNamesSet.has(String(name));
};
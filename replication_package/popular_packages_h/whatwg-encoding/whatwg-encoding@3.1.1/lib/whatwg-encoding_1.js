"use strict";
const iconvLite = require("iconv-lite");
const supportedNames = require("./supported-names.json");
const labelsToNames = require("./labels-to-names.json");

const supportedNamesSet = new Set(supportedNames);

function labelToName(label) {
  label = String(label).trim().toLowerCase();
  return labelsToNames[label] || null;
}

function decode(uint8Array, fallbackEncodingName) {
  let encoding = fallbackEncodingName;
  if (!isSupported(encoding)) {
    throw new RangeError(`"${encoding}" is not a supported encoding name`);
  }

  const bomEncoding = getBOMEncoding(uint8Array);
  if (bomEncoding !== null) {
    encoding = bomEncoding;
  }

  if (encoding === "x-user-defined") {
    let result = "";
    for (const byte of uint8Array) {
      if (byte <= 0x7F) {
        result += String.fromCodePoint(byte);
      } else {
        result += String.fromCodePoint(0xF780 + byte - 0x80);
      }
    }
    return result;
  }

  return iconvLite.decode(uint8Array, encoding);
}

function getBOMEncoding(uint8Array) {
  if (uint8Array[0] === 0xFE && uint8Array[1] === 0xFF) {
    return "UTF-16BE";
  } else if (uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) {
    return "UTF-16LE";
  } else if (uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
    return "UTF-8";
  }
  return null;
}

function isSupported(name) {
  return supportedNamesSet.has(String(name));
}

module.exports = {
  labelToName,
  decode,
  getBOMEncoding,
  isSupported
};

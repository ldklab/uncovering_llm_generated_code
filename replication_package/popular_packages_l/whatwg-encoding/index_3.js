// package.json
{
  "name": "whatwg-encoding",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "iconv-lite": "^0.6.3"
  }
}

// index.js
const iconv = require('iconv-lite');
const encodingNames = require('./encoding-names');

// Converts a label to a standard encoding name
function labelToName(label) {
  const normalizedLabel = label.trim().toLowerCase();
  return encodingNames[normalizedLabel] || null;
}

// Checks if the given encoding name is supported by iconv-lite
function isSupported(name) {
  const encoding = labelToName(name);
  return encoding ? iconv.encodingExists(encoding) : false;
}

// Identifies the character encoding by examining the BOM
function getBOMEncoding(uint8Array) {
  if (uint8Array[0] === 0xEF && uint8Array[1] === 0xBB && uint8Array[2] === 0xBF) {
    return "UTF-8";
  }
  if (uint8Array[0] === 0xFE && uint8Array[1] === 0xFF) {
    return "UTF-16BE";
  }
  if (uint8Array[0] === 0xFF && uint8Array[1] === 0xFE) {
    return "UTF-16LE";
  }
  return null;
}

// Decodes the Uint8Array using the BOM encoding if present, otherwise uses the fallback
function decode(uint8Array, fallbackEncodingName) {
  const detectedEncoding = getBOMEncoding(uint8Array) || labelToName(fallbackEncodingName);
  if (!detectedEncoding || !iconv.encodingExists(detectedEncoding)) {
    throw new Error("Unsupported encoding");
  }
  return iconv.decode(uint8Array, detectedEncoding);
}

module.exports = {
  labelToName,
  isSupported,
  getBOMEncoding,
  decode
};

// encoding-names.js
module.exports = {
  "latin1": "windows-1252",
  "iso-8859-1": "windows-1252",
  "cyrillic": "ISO-8859-5",
  "ascii": "windows-1252",
  "ibm866": "IBM866",
  "utf-8": "UTF-8",
  "utf-16": "UTF-16LE",
  // Additional encoding label-standard name mappings
};

// Example validations
const whatwgEncoding = require("./index");

console.assert(whatwgEncoding.labelToName("latin1") === "windows-1252");
console.assert(whatwgEncoding.labelToName("  CYRILLic ") === "ISO-8859-5");

console.assert(whatwgEncoding.isSupported("IBM866") === true);
console.assert(whatwgEncoding.isSupported("UTF-32") === false);
console.assert(whatwgEncoding.isSupported("x-mac-cyrillic") === false);

console.assert(whatwgEncoding.getBOMEncoding(new Uint8Array([0xFE, 0xFF])) === "UTF-16BE");
console.assert(whatwgEncoding.getBOMEncoding(new Uint8Array([0x48, 0x69])) === null);

console.assert(whatwgEncoding.decode(new Uint8Array([0x48, 0x69]), "UTF-8") === "Hi");

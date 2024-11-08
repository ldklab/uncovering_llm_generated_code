"use strict";
const whatwgEncoding = require("whatwg-encoding");

module.exports = function determineEncoding(uint8Array, options = {}) {
  const { transportLayerEncodingLabel, defaultEncoding = "windows-1252" } = options;
  let encoding = whatwgEncoding.getBOMEncoding(uint8Array);

  if (!encoding && transportLayerEncodingLabel) {
    encoding = whatwgEncoding.labelToName(transportLayerEncodingLabel);
  }

  if (!encoding) {
    encoding = scanForMetaCharset(uint8Array);
  }

  if (!encoding) {
    encoding = defaultEncoding;
  }

  return encoding;
};

function scanForMetaCharset(uint8Array) {
  const maxBytesToCheck = Math.min(uint8Array.byteLength, 1024);
  for (let i = 0; i < maxBytesToCheck; i++) {
    let byte = uint8Array[i];
    if (byte === 0x3C) { // "<"
      const [byte1, byte2, byte3, byte4, byte5] = [
        uint8Array[i + 1], uint8Array[i + 2], uint8Array[i + 3], uint8Array[i + 4], uint8Array[i + 5]
      ];

      if (byte1 === 0x21 && byte2 === 0x2D && byte3 === 0x2D) { // <!--
        i += 4;
        while (i < maxBytesToCheck) {
          byte = uint8Array[i];
          if (byte === 0x3E && uint8Array[i - 1] === 0x2D && uint8Array[i - 2] === 0x2D) { // -->
            break;
          }
          i++;
        }
      } else if (matchesMeta(byte1, byte2, byte3, byte4, byte5)) {
        i += 6;
        return processMetaTag(uint8Array, i, maxBytesToCheck);
      } else if (isAlpha(byte1)) { // Tag but not meta
        for (i += 2; i < maxBytesToCheck; i++) {
          byte = uint8Array[i];
          if (isSpaceCharacter(byte) || byte === 0x3E) {
            break;
          }
        }
        processRemainingAttributes(uint8Array, i, maxBytesToCheck);
      } else if (byte1 === 0x21 || byte1 === 0x2F || byte1 === 0x3F) { // !, /, ? (comments, etc.)
        for (i += 2; i < maxBytesToCheck; i++) {
          byte = uint8Array[i];
          if (byte === 0x3E) {
            break;
          }
        }
      }
    }
  }
  return null;
}

function matchesMeta(c1, c2, c3, c4, c5) {
  return (c1 === 0x4D || c1 === 0x6D) && // "M" or "m"
         (c2 === 0x45 || c2 === 0x65) && // "E" or "e"
         (c3 === 0x54 || c3 === 0x74) && // "T" or "t"
         (c4 === 0x41 || c4 === 0x61) && // "A" or "a"
         (isSpaceCharacter(c5) || c5 === 0x2F); // Space or "/"
}

function processMetaTag(uint8Array, i, l) {
  const attributeList = new Set();
  let gotPragma = false;
  let needPragma = null;
  let charset = null;

  let attrResult;
  do {
    attrResult = getAttribute(uint8Array, i, l);
    if (attrResult.attr && !attributeList.has(attrResult.attr.name)) {
      processAttribute(attrResult, attributeList);
      if (attrResult.attr.name === "charset") {
        charset = whatwgEncoding.labelToName(attrResult.attr.value);
        needPragma = false;
      }
      if (attrResult.attr.name === "content" && !charset) {
        charset = extractCharacterEncodingFromMeta(attrResult.attr.value);
        if (charset) {
          needPragma = true;
        }
      }
    }
    i = attrResult.i;
  } while (attrResult.attr);

  return finalizeMetaTag(charset, needPragma, gotPragma);
}

function processAttribute(attrResult, attributeList) {
  attributeList.add(attrResult.attr.name);
  if (attrResult.attr.name === "http-equiv") {
    attrResult.gotPragma = attrResult.attr.value === "content-type";
  }
}

function finalizeMetaTag(charset, needPragma, gotPragma) {
  if (needPragma && !gotPragma) {
    return null;
  }
  if (!charset) {
    return null;
  }
  if (charset === "UTF-16LE" || charset === "UTF-16BE") {
    return "UTF-8";
  }
  return charset === "x-user-defined" ? "windows-1252" : charset;
}

function processRemainingAttributes(uint8Array, i, l) {
  let attrResult;
  do {
    attrResult = getAttribute(uint8Array, i, l);
    i = attrResult.i;
  } while (attrResult.attr);
}

function getAttribute(uint8Array, i, l) {
  for (; i < l; i++) {
    let byte = uint8Array[i];
    if (isSpaceCharacter(byte) || byte === 0x2F) {
      continue;
    }
    if (byte === 0x3E) break;

    let name = "";
    let value = "";

    while (i < l) {
      byte = uint8Array[i];
      if (byte === 0x3D && name) {
        i++;
        break;
      }
      if (isSpaceCharacter(byte) || byte === 0x2F || byte === 0x3E) {
        return { attr: { name, value }, i };
      }
      name += toLowerCaseIfUpper(byte);
      i++;
    }

    i = skipSpaces(uint8Array, i, l);

    byte = uint8Array[i];
    if (byte === 0x22 || byte === 0x27) {
      value = getQuotedAttributeValue(uint8Array, i, l, byte);
      i++;
      return { attr: { name, value }, i };
    }
    value = getUnquotedAttributeValue(uint8Array, i, l);
    if (byte === 0x3E) return { attr: { name, value }, i };
  }
  return { i };
}

function skipSpaces(uint8Array, i, l) {
  while (i < l && isSpaceCharacter(uint8Array[i])) {
    i++;
  }
  return i;
}

function toLowerCaseIfUpper(byte) {
  return byte >= 0x41 && byte <= 0x5A ? 
    String.fromCharCode(byte + 0x20) :
    String.fromCharCode(byte);
}

function getQuotedAttributeValue(uint8Array, i, l, quote) {
  let value = "";
  for (i++; i < l; i++) {
    let byte = uint8Array[i];
    if (byte === quote) {
      i++;
      break;
    }
    value += toLowerCaseIfUpper(byte);
  }
  return value;
}

function getUnquotedAttributeValue(uint8Array, i, l) {
  let value = "";
  for (i++; i < l; i++) {
    let byte = uint8Array[i];
    if (isSpaceCharacter(byte) || byte === 0x3E) {
      break;
    }
    value += toLowerCaseIfUpper(byte);
  }
  return value;
}

function extractCharacterEncodingFromMeta(string) {
  let position = 0;
  while (true) {
    const indexOfCharset = string.substring(position).search(/charset/ui);
    if (indexOfCharset === -1) return null;
    position += indexOfCharset + "charset".length;

    position = skipStringSpaces(string, position);

    if (string[position] !== "=") {
      continue;
    }
    position++;
    position = skipStringSpaces(string, position);

    return findEncodingInQuoteOrSemicolon(string, position);
  }
}

function skipStringSpaces(string, position) {
  while (position < string.length && isSpaceCharacter(string[position].charCodeAt(0))) {
    position++;
  }
  return position;
}

function findEncodingInQuoteOrSemicolon(string, position) {
  if (string[position] === "\"" || string[position] === "'") {
    const nextIndex = string.indexOf(string[position], position + 1);
    if (nextIndex !== -1) {
      return whatwgEncoding.labelToName(string.substring(position + 1, nextIndex));
    }
    return null; // Unmatched quotation mark
  }

  const subString = string.substring(position + 1);
  const indexOfWhitespaceOrSemicolon = subString.search(/\x09|\x0A|\x0C|\x0D|\x20|;/u);
  const end = indexOfWhitespaceOrSemicolon === -1 ? string.length : position + indexOfWhitespaceOrSemicolon + 1;

  return whatwgEncoding.labelToName(string.substring(position, end));
}

function isAlpha(byte) {
  return (byte >= 0x41 && byte <= 0x5A) || (byte >= 0x61 && byte <= 0x7A);
}

function isSpaceCharacter(byte) {
  return byte === 0x09 || byte === 0x0A || byte === 0x0C || byte === 0x0D || byte === 0x20;
}

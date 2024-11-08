"use strict";
const whatwgEncoding = require("whatwg-encoding");

// Function to determine the encoding of a given buffer
module.exports = (buffer, { transportLayerEncodingLabel, defaultEncoding = "windows-1252" } = {}) => {
  let encoding = determineEncodingFromBOM(buffer);

  if (encoding === null && transportLayerEncodingLabel !== undefined) {
    encoding = whatwgEncoding.labelToName(transportLayerEncodingLabel);
  }

  if (encoding === null) {
    encoding = prescanMetaCharset(buffer);
  }

  if (encoding === null) {
    encoding = defaultEncoding;
  }

  return encoding;
};

function determineEncodingFromBOM(buffer) {
  return whatwgEncoding.getBOMEncoding(buffer);
}

function prescanMetaCharset(buffer) {
  const limit = Math.min(buffer.length, 1024);
  for (let i = 0; i < limit; i++) {
    let currentByte = buffer[i];
    if (currentByte === 0x3C) { // "<"
      const [c1, c2, c3, c4, c5] = buffer.slice(i + 1, i + 6);

      if (c1 === 0x21 && c2 === 0x2D && c3 === 0x2D) { // "<!--"
        i = skipComments(buffer, i, limit);
      } else if (matchesMetaTag(c1, c2, c3, c4, c5)) {
        i += 6;
        const encoding = extractCharsetFromMeta(buffer, i, limit);
        if (encoding) return encoding;
      } else {
        i = skipToEndOfTag(buffer, i + 2, limit);
      }
    }
  }
  return null;
}

function skipComments(buffer, i, limit) {
  for (i += 4; i < limit; i++) {
    const currentByte = buffer[i];
    if (currentByte === 0x3E && buffer[i - 1] === 0x2D && buffer[i - 2] === 0x2D) { // "-->"
      return i;
    }
  }
  return i;
}

function matchesMetaTag(c1, c2, c3, c4, c5) {
  return (c1 === 0x4D || c1 === 0x6D) && // "M" or "m"
         (c2 === 0x45 || c2 === 0x65) && // "E" or "e"
         (c3 === 0x54 || c3 === 0x74) && // "T" or "t"
         (c4 === 0x41 || c4 === 0x61) && // "A" or "a"
         (isSpaceCharacter(c5) || c5 === 0x2F); // space or "/"
}

function skipToEndOfTag(buffer, i, limit) {
  for (; i < limit; i++) {
    const currentByte = buffer[i];
    if (isSpaceCharacter(currentByte) || currentByte === 0x3E) { // space or ">"
      break;
    }
  }
  return i;
}

function extractCharsetFromMeta(buffer, i, limit) {
  const attributeList = new Set();
  let gotPragma = false;
  let needPragma = null;
  let charset = null;

  let attrRes;
  while ((attrRes = getAttribute(buffer, i, limit)) && attrRes.attr) {
    i = attrRes.i;
    const { name, value } = attrRes.attr;
    if (!attributeList.has(name)) {
      attributeList.add(name);
      if (name === "http-equiv" && value === "content-type") gotPragma = true;
      if (name === "content" && !charset) {
        charset = extractCharacterEncodingFromMeta(value);
        needPragma = charset !== null;
      }
      if (name === "charset") {
        charset = whatwgEncoding.labelToName(value);
        needPragma = false;
      }
    }
  }

  if (needPragma && !gotPragma) return null;
  if (charset && (charset === "UTF-16LE" || charset === "UTF-16BE")) return "UTF-8";
  if (charset === "x-user-defined") return "windows-1252";
  return charset;
}

function getAttribute(buffer, i, limit) {
  while (i < limit) {
    const currentByte = buffer[i];
    if (isSpaceCharacter(currentByte) || currentByte === 0x2F) {
      i++;
      continue;
    }
    if (currentByte === 0x3E) break;

    let name = "", value = "";
    const [updatedName, updatedPos] = parseAttributeName(buffer, i, limit);
    name = updatedName;
    i = parseAttributeValue(buffer, updatedPos, limit, name, value);
    
    if (name) return { attr: { name, value }, i };
  }
  return { i };
}

function parseAttributeName(buffer, i, limit) {
  let name = "";
  for (; i < limit; i++) {
    const currentByte = buffer[i];
    if (currentByte === 0x3D && name) return [name, ++i];
    if (isSpaceCharacter(currentByte)) {
      i = skipSpaces(buffer, i, limit);
      if (buffer[i] !== 0x3D) return [name, i];
      return [name, ++i];
    }
    if (currentByte === 0x2F || currentByte === 0x3E) return [name, i];
    name += String.fromCharCode(currentByte >= 0x41 && currentByte <= 0x5A ? currentByte + 0x20 : currentByte);
  }
  return [name, i];
}

function parseAttributeValue(buffer, i, limit, name, value) {
  if (isSpaceCharacter(buffer[i])) {
    i = skipSpaces(buffer, i, limit);
  }
  const quoteChar = buffer[i];
  if (quoteChar === 0x22 || quoteChar === 0x27) {
    for (i++; i < limit; i++) {
      const currentByte = buffer[i];
      if (currentByte === quoteChar) return ++i;
      value += String.fromCharCode(currentByte >= 0x41 && currentByte <= 0x5A ? currentByte + 0x20 : currentByte);
    }
  }
  return parseUnquotedValue(buffer, i, limit, value);
}

function parseUnquotedValue(buffer, i, limit, value) {
  for (; i < limit; i++) {
    const currentByte = buffer[i];
    if (isSpaceCharacter(currentByte) || currentByte === 0x3E) return ++i;
    value += String.fromCharCode(currentByte >= 0x41 && currentByte <= 0x5A ? currentByte + 0x20 : currentByte);
  }
  return i;
}

function skipSpaces(buffer, i, limit) {
  while (i < limit && isSpaceCharacter(buffer[i])) {
    i++;
  }
  return i;
}

function extractCharacterEncodingFromMeta(content) {
  let position = 0;
  while (position < content.length) {
    const index = content.substring(position).search(/charset/i);
    if (index === -1) return null;
    let subPosition = position + index + "charset".length;
    subPosition = skipSpacesInString(content, subPosition);
    if (content[subPosition] !== "=") {
      position = subPosition;
      continue;
    }
    subPosition = skipSpacesInString(content, ++subPosition);
    position = subPosition;
    break;
  }
  return extractEncodingFromSubstring(content, position);
}

function skipSpacesInString(string, position) {
  while (isSpaceCharacter(string.charCodeAt(position))) {
    position++;
  }
  return position;
}

function extractEncodingFromSubstring(string, position) {
  if (string[position] === "\"" || string[position] === "'") {
    const nextIndex = string.indexOf(string[position], position + 1);
    if (nextIndex !== -1) return whatwgEncoding.labelToName(string.substring(position + 1, nextIndex));
    return null;
  }
  const searchResult = string.substring(position + 1).search(/[\x09\x0A\x0C\x0D\x20;]/);
  const endPosition = searchResult === -1 ? string.length : position + searchResult + 1;
  return whatwgEncoding.labelToName(string.substring(position, endPosition));
}

function isSpaceCharacter(byte) {
  return byte === 0x09 || byte === 0x0A || byte === 0x0C || byte === 0x0D || byte === 0x20;
}

"use strict";
const { getBOMEncoding, labelToName } = require("whatwg-encoding");

module.exports = function determineEncoding(uint8Array, options = {}) {
  const { transportLayerEncodingLabel, defaultEncoding = "windows-1252" } = options;
  
  let encoding = getBOMEncoding(uint8Array) || 
                 labelToName(transportLayerEncodingLabel) ||
                 scanMetaCharset(uint8Array) || 
                 defaultEncoding;

  return encoding;
};

function scanMetaCharset(uint8Array) {
  const lengthToScan = Math.min(uint8Array.byteLength, 1024);
  for (let i = 0; i < lengthToScan; i++) {
    const c = uint8Array[i];
    if (c === 0x3C) { // "<"
      const c1 = uint8Array[i + 1];
      const c2 = uint8Array[i + 2];
      const c3 = uint8Array[i + 3];
      const c4 = uint8Array[i + 4];
      const c5 = uint8Array[i + 5];
      
      if (c1 === 0x21 && c2 === 0x2D && c3 === 0x2D) { // <!--
        i = skipComment(uint8Array, i + 3, lengthToScan);
      } else if (matchesMetaTag(c1, c2, c3, c4, c5)) {
        const metaResult = extractFromMetaTag(uint8Array, i + 6, lengthToScan);
        if (metaResult.charset) {
          return adjustCharset(metaResult.charset, metaResult.needPragma, metaResult.gotPragma);
        }
      } else {
        i = skipTag(uint8Array, i + 1, lengthToScan);
      }
    }
  }
  return null;
}

function skipComment(array, startIndex, limit) {
  for (let i = startIndex; i < limit; i++) {
    if (array[i] === 0x3E && array[i - 1] === 0x2D && array[i - 2] === 0x2D) {
      return i;
    }
  }
  return limit;
}

function matchesMetaTag(c1, c2, c3, c4, c5) {
  return (c1 === 0x4D || c1 === 0x6D) && (c2 === 0x45 || c2 === 0x65) &&
         (c3 === 0x54 || c3 === 0x74) && (c4 === 0x41 || c4 === 0x61) &&
         (isSpaceOrSlash(c5));
}

function isSpaceOrSlash(char) {
  return isSpaceCharacter(char) || char === 0x2F;
}

function extractFromMetaTag(uint8Array, index, limit) {
  const attributes = new Set();
  let gotPragma = false, needPragma = null, charset = null;
  
  let attrResult;
  do {
    attrResult = parseAttribute(uint8Array, index, limit);
    if (attrResult.attr && !attributes.has(attrResult.attr.name)) {
      attributes.add(attrResult.attr.name);
      ({ gotPragma, needPragma, charset } = processAttribute(attrResult, gotPragma, charset));
    }
    index = attrResult.index;
  } while (attrResult.attr);
  
  return { charset, needPragma, gotPragma };
}

function processAttribute(attrResult, gotPragma, charset) {
  if (attrResult.attr.name === "http-equiv") {
    gotPragma = (attrResult.attr.value === "content-type");
  } else if (attrResult.attr.name === "content" && !charset) {
    charset = extractEncoding(attrResult.attr.value);
    if (charset) {
      needPragma = true;
    }
  } else if (attrResult.attr.name === "charset") {
    charset = labelToName(attrResult.attr.value);
    needPragma = false;
  }
  return { gotPragma, needPragma, charset };
}

function adjustCharset(charset, needPragma, gotPragma) {
  if (needPragma === null || (needPragma && !gotPragma) || !charset) {
    return null;
  }
  if (charset === "UTF-16LE" || charset === "UTF-16BE") {
    return "UTF-8";
  }
  if (charset === "x-user-defined") {
    return "windows-1252";
  }
  return charset;
}

function skipTag(array, startIndex, limit) {
  for (let i = startIndex; i < limit; i++) {
    const c = array[i];
    if (isSpaceCharacter(c) || c === 0x3E) {
      return i + 1;
    }
  }
  return limit;
}

function parseAttribute(uint8Array, index, limit) {
  let name = "", value = "", c;
  for (; index < limit; index++) {
    c = uint8Array[index];
    if (isSpaceCharacter(c) || c === 0x2F) continue;
    if (c === 0x3E) break;
    name = collectName(uint8Array, index, limit);
    index += name.length;

    c = uint8Array[index];
    if (c === 0x3D) { // "="
      index++;
      for (; index < limit; index++) {
        c = uint8Array[index];
        if (!isSpaceCharacter(c)) {
          break;
        }
      }
      value = collectValue(uint8Array, index, limit);
      index += value.length;
    }
    return { attr: { name, value }, index };
  }
  return { index };
}

function collectName(uint8Array, index, limit) {
  let name = "";
  for (; index < limit; index++) {
    const c = uint8Array[index];
    if (c === 0x3D || isSpaceCharacter(c) || c === 0x2F || c === 0x3E) break;
    name += c >= 0x41 && c <= 0x5A ? String.fromCharCode(c + 0x20) : String.fromCharCode(c);
  }
  return name;
}

function collectValue(uint8Array, index, limit) {
  let value = "", c;
  for (; index < limit; index++) {
    c = uint8Array[index];
    if (c === 0x3E || isSpaceCharacter(c)) break;
    value += c >= 0x41 && c <= 0x5A ? String.fromCharCode(c + 0x20) : String.fromCharCode(c);
  }
  return value;
}

function extractEncoding(metaContent) {
  let position = 0;
  while (true) {
    const charsetIndex = metaContent.substring(position).search(/charset/ui);
    if (charsetIndex === -1) return null;
    let subIndex = position + charsetIndex + "charset".length;
    while (isSpaceCharacter(metaContent[subIndex].charCodeAt(0))) {
      subIndex++;
    }
    if (metaContent[subIndex++] !== '=') {
      position = subIndex;
      continue;
    }
    while (isSpaceCharacter(metaContent[subIndex].charCodeAt(0))) {
      subIndex++;
    }
    position = subIndex;
    break;
  }
  
  if (metaContent[position] === '"' || metaContent[position] === "'") {
    const nextQuoteIndex = metaContent.indexOf(metaContent[position], position + 1);
    if (nextQuoteIndex !== -1) {
      return labelToName(metaContent.substring(position + 1, nextQuoteIndex));
    }
    return null;
  }
  
  if (metaContent.length === position) return null;
  const spaceOrSemicolonIndex = metaContent.substring(position).search(/\x09|\x0A|\x0C|\x0D|\x20|;/u);
  const end = (spaceOrSemicolonIndex === -1) ? metaContent.length : position + spaceOrSemicolonIndex;
  return labelToName(metaContent.substring(position, end));
}

function isSpaceCharacter(character) {
  return [0x09, 0x0A, 0x0C, 0x0D, 0x20].includes(character);
}

"use strict";
const whatwgEncoding = require("whatwg-encoding");

module.exports = (uint8Array, { transportLayerEncodingLabel, defaultEncoding = "windows-1252" } = {}) => {
  let encoding = whatwgEncoding.getBOMEncoding(uint8Array);
  
  if (!encoding && transportLayerEncodingLabel) {
    encoding = whatwgEncoding.labelToName(transportLayerEncodingLabel);
  }
  
  if (!encoding) {
    encoding = prescanMetaCharset(uint8Array);
  }
  
  return encoding || defaultEncoding;
};

function prescanMetaCharset(uint8Array) {
  const limit = Math.min(uint8Array.byteLength, 1024);
  
  for (let i = 0; i < limit; i++) {
    const char = uint8Array[i];
    
    if (char === 0x3C) { // "<"
      const nextChars = Array.from(uint8Array.slice(i + 1, i + 6));
      
      if (nextChars[0] === 0x21 && nextChars[1] === 0x2D && nextChars[2] === 0x2D) {
        i += 4;
        for (; i < limit; i++) {
          const currentChar = uint8Array[i];
          if (currentChar === 0x3E && uint8Array[i - 1] === 0x2D && uint8Array[i - 2] === 0x2D) break;
        }
      } else if (/^meta/i.test(String.fromCharCode(...nextChars.slice(0, 4))) && (isSpaceCharacter(nextChars[4]) || nextChars[4] === 0x2F)) {
        i += 6;
        const attributeList = new Set();
        let gotPragma = false, needPragma = null, charset = null;
        let attrResult;

        do {
          attrResult = getAttribute(uint8Array, i, limit);
          const { attr, index } = attrResult;
          if (attr && !attributeList.has(attr.name)) {
            attributeList.add(attr.name);
            if (attr.name === "http-equiv" && (gotPragma = attr.value === "content-type")) {}
            else if (attr.name === "content" && !charset) charset = extractCharacterEncodingFromMeta(attr.value);
            else if (attr.name === "charset") {
              charset = whatwgEncoding.labelToName(attr.value);
              needPragma = false;
            }
          }
          i = index;
        } while (attrResult.attr);

        if (needPragma && !gotPragma) continue;
        if (charset) {
          if (["UTF-16LE", "UTF-16BE"].includes(charset)) charset = "UTF-8";
          if (charset === "x-user-defined") charset = "windows-1252";
          return charset;
        }
      } else if (/^[a-zA-Z]/.test(String.fromCharCode(nextChars[0]))) {
        for (i += 2; i < limit; i++) if (isSpaceCharacter(uint8Array[i]) || uint8Array[i] === 0x3E) break;
        let attrResult;
        do {
          attrResult = getAttribute(uint8Array, i, limit);
          i = attrResult.index;
        } while (attrResult.attr);
      } else if ([0x21, 0x2F, 0x3F].includes(nextChars[0])) {
        for (i += 2; i < limit; i++) if (uint8Array[i] === 0x3E) break;
      }
    }
  }
  return null;
}

function getAttribute(uint8Array, startIndex, limit) {
  for (let index = startIndex; index < limit; index++) {
    const char = uint8Array[index];
    if (isSpaceCharacter(char) || char === 0x2F) continue;
    if (char === 0x3E) break;
    
    let name = "", value = "";
    for (; index < limit; index++) {
      const nextChar = uint8Array[index];
      if (nextChar === 0x3D && name) {
        index++;
        break;
      }
      if (isSpaceCharacter(nextChar)) {
        for (index++; index < limit && isSpaceCharacter(uint8Array[index]); index++);
        if (uint8Array[index] !== 0x3D) return { attr: { name, value }, index };
        index++;
        break;
      }
      if ([0x2F, 0x3E].includes(nextChar)) return { attr: { name, value }, index };
      if (nextChar >= 0x41 && nextChar <= 0x5A) name += String.fromCharCode(nextChar + 0x20);
      else name += String.fromCharCode(nextChar);
    }

    let nextChar = uint8Array[index];
    if (isSpaceCharacter(nextChar)) {
      for (index++; index < limit && isSpaceCharacter(uint8Array[index]); index++);
    }
    if ([0x22, 0x27].includes(nextChar)) {
      const quote = nextChar;
      for (index++; index < limit; index++) {
        const valueChar = uint8Array[index];
        if (valueChar === quote) {
          index++;
          return { attr: { name, value }, index };
        }
        if (valueChar >= 0x41 && valueChar <= 0x5A) value += String.fromCharCode(valueChar + 0x20);
        else value += String.fromCharCode(valueChar);
      }
    }
    
    if (nextChar === 0x3E || [0x2F, 0x3E].includes(nextChar)) return { attr: { name, value }, index };
    if (nextChar >= 0x41 && nextChar <= 0x5A) value += String.fromCharCode(nextChar + 0x20);
    else value += String.fromCharCode(nextChar);

    for (index++; index < limit; index++) {
      const valueChar = uint8Array[index];
      if (isSpaceCharacter(valueChar) || valueChar === 0x3E) return { attr: { name, value }, index };
      if (valueChar >= 0x41 && valueChar <= 0x5A) value += String.fromCharCode(valueChar + 0x20);
      else value += String.fromCharCode(valueChar);
    }
  }
  return { index: startIndex };
}

function extractCharacterEncodingFromMeta(string) {
  let position = 0;
  while (true) {
    const charsetIndex = string.substring(position).search(/charset/ui);
    if (charsetIndex === -1) return null;
    
    let subPos = position + charsetIndex + "charset".length;
    while (isSpaceCharacter(string[subPos].charCodeAt(0))) subPos++;
    if (string[subPos] !== "=") {
      position = subPos - 1;
      continue;
    }
    
    subPos++;
    while (isSpaceCharacter(string[subPos].charCodeAt(0))) subPos++;
    position = subPos;
    break;
  }

  if (['"', "'"].includes(string[position])) {
    const endPos = string.indexOf(string[position], position + 1);
    if (endPos !== -1) return whatwgEncoding.labelToName(string.substring(position + 1, endPos));

    return null;
  }

  if (string.position === position + 1) return null;
  
  const endPos = string.substring(position + 1).search(/\x09|\x0A|\x0C|\x0D|\x20|;/u);
  const endIndex = endPos === -1 ? string.length : position + endPos + 1;
  return whatwgEncoding.labelToName(string.substring(position, endIndex));
}

function isSpaceCharacter(char) {
  return [0x09, 0x0A, 0x0C, 0x0D, 0x20].includes(char);
}

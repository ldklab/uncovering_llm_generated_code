"use strict";
const whatwgEncoding = require("whatwg-encoding");

module.exports = (buffer, { transportLayerEncodingLabel, defaultEncoding = "windows-1252" } = {}) => {
  let encoding = whatwgEncoding.getBOMEncoding(buffer);

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

function prescanMetaCharset(buffer) {
  const length = Math.min(buffer.length, 1024);
  for (let i = 0; i < length; i++) {
    if (buffer[i] === 0x3C) {
      const metaPattern = [0x4D, 0x45, 0x54, 0x41]; // "META"
      const c1 = buffer[i + 1];
      const c2 = buffer[i + 2];
      const c3 = buffer[i + 3];
      const c4 = buffer[i + 4];
      const c5 = buffer[i + 5];
      if (c1 === 0x21 && c2 === 0x2D && c3 === 0x2D) { 
        i = skipComment(buffer, i, length);
      } else if (isMatchingMeta(metaPattern, [c1, c2, c3, c4]) && (isSpaceCharacter(c5) || c5 === 0x2F)) {
        i += 6;
        const result = parseMetaAttributes(buffer, i, length);
        if (result && (!result.needPragma || result.gotPragma)) {
          return adjustCharset(result.charset);
        }
      } else if (isAlphabetic(c1)) {
        i = skipTag(buffer, i, length);
      } else if (c1 === 0x21 || c1 === 0x2F || c1 === 0x3F) {
        i = skipToEndOfTag(buffer, i, length);
      }
    }
  }
  return null;
}

function skipComment(buffer, index, length) {
  for (let i = index + 4; i < length; i++) {
    if (buffer[i] === 0x3E && buffer[i - 1] === 0x2D && buffer[i - 2] === 0x2D) {
      return i;
    }
  }
  return index;
}

function isMatchingMeta(pattern, chars) {
  return pattern.every((char, i) => char === chars[i] || char + 0x20 === chars[i]);
}

function parseMetaAttributes(buffer, index, length) {
  const attributes = new Set();
  let gotPragma = false, needPragma = null, charset = null;

  for (let res = {}; res.attr || index < length; ) {
    res = getAttribute(buffer, index, length);
    if (res.attr && !attributes.has(res.attr.name)) {
      attributes.add(res.attr.name);
      if (res.attr.name === "http-equiv") {
        gotPragma = res.attr.value === "content-type";
      } else if (res.attr.name === "content" && !charset) {
        charset = extractCharacterEncodingFromMeta(res.attr.value);
        if (charset) needPragma = true;
      } else if (res.attr.name === "charset") {
        charset = whatwgEncoding.labelToName(res.attr.value);
        needPragma = false;
      }
    }
    index = res.i;
  }
  return { gotPragma, needPragma, charset };
}

function adjustCharset(charset) {
  if (charset === "UTF-16LE" || charset === "UTF-16BE") {
    return "UTF-8";
  }
  if (charset === "x-user-defined") {
    return "windows-1252";
  }
  return charset;
}

function skipTag(buffer, index, length) {
  for (let i = index + 2; i < length; i++) {
    const c = buffer[i];
    if (isSpaceCharacter(c) || c === 0x3E) {
      return i;
    }
  }
  return index;
}

function skipToEndOfTag(buffer, index, length) {
  for (let i = index + 2; i < length; i++) {
    if (buffer[i] === 0x3E) {
      return i;
    }
  }
  return index;
}

function getAttribute(buffer, i, l) {
  for (; i < l; i++) {
    let c = buffer[i];
    if (isSpaceCharacter(c) || c === 0x2F) {
      continue;
    }
    if (c === 0x3E) {
      break;
    }
    let name = "", value = "";
    for (; i < l; i++) {
      c = buffer[i];
      if (c === 0x3D && name !== "") {
        i++;
        break;
      }
      if (isSpaceCharacter(c)) {
        for (i++; i < l; i++) {
          c = buffer[i];
          if (isSpaceCharacter(c)) {
            continue;
          }
          if (c !== 0x3D) {
            return { attr: { name, value }, i };
          }
          i++;
          break;
        }
        break;
      }
      if (c === 0x2F || c === 0x3E) {
        return { attr: { name, value }, i };
      }
      name += String.fromCharCode(c >= 0x41 && c <= 0x5A ? c + 0x20 : c);
    }
    c = buffer[i];
    if (isSpaceCharacter(c)) {
      for (i++; i < l; i++) {
        c = buffer[i];
        if (isSpaceCharacter(c)) continue;
        else break;
      }
    }
    if (c === 0x22 || c === 0x27) {
      const quote = c;
      for (i++; i < l; i++) {
        c = buffer[i];
        if (c === quote) {
          i++;
          return { attr: { name, value }, i };
        }
        value += String.fromCharCode(c >= 0x41 && c <= 0x5A ? c + 0x20 : c);
      }
    }
    if (c === 0x3E) {
      return { attr: { name, value }, i };
    }
    value += String.fromCharCode(c >= 0x41 && c <= 0x5A ? c + 0x20 : c);
    for (i++; i < l; i++) {
      c = buffer[i];
      if (isSpaceCharacter(c) || c === 0x3E) {
        return { attr: { name, value }, i };
      }
      value += String.fromCharCode(c >= 0x41 && c <= 0x5A ? c + 0x20 : c);
    }
  }
  return { i };
}

function extractCharacterEncodingFromMeta(string) {
  let position = 0;

  while (true) {
    const indexOfCharset = string.substring(position).search(/charset/i);
    if (indexOfCharset === -1) return null;
    let subPosition = position + indexOfCharset + "charset".length;

    while (isSpaceCharacter(string[subPosition].charCodeAt(0))) ++subPosition;
    if (string[subPosition] !== "=") {
      position = subPosition - 1;
      continue;
    }

    ++subPosition;
    while (isSpaceCharacter(string[subPosition].charCodeAt(0))) ++subPosition;
    position = subPosition;
    break;
  }

  if (string[position] === "\"" || string[position] === "'") {
    const nextIndex = string.indexOf(string[position], position + 1);
    return nextIndex !== -1 ? whatwgEncoding.labelToName(string.substring(position + 1, nextIndex)) : null;
  }

  if (string.length === position + 1) return null;
  const indexOfEnds = string.substring(position + 1).search(/\x09|\x0A|\x0C|\x0D|\x20|;/);
  const end = indexOfEnds === -1 ? string.length : position + indexOfEnds + 1;

  return whatwgEncoding.labelToName(string.substring(position, end));
}

function isSpaceCharacter(c) {
  return c === 0x09 || c === 0x0A || c === 0x0C || c === 0x0D || c === 0x20;
}

function isAlphabetic(charCode) {
  return (charCode >= 0x41 && charCode <= 0x5A) || (charCode >= 0x61 && charCode <= 0x7A);
}

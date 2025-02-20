"use strict";
const whatwgEncoding = require("whatwg-encoding");

module.exports = (uint8Array, { transportLayerEncodingLabel, defaultEncoding = "windows-1252" } = {}) => {
  let encoding = whatwgEncoding.getBOMEncoding(uint8Array);

  if (!encoding && transportLayerEncodingLabel !== undefined) {
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
    let c = uint8Array[i];
    if (c === 0x3C) { // "<"
      const [c1, c2, c3, c4, c5] = uint8Array.slice(i + 1, i + 6);

      if (c1 === 0x21 && c2 === 0x2D && c3 === 0x2D) { // comment start "<!--"
        i = skipComment(uint8Array, i + 4, limit);
      } else if (matchesMetaTag(c1, c2, c3, c4, c5)) {
        i += 6;
        const charset = extractCharsetFromMeta(uint8Array, i, limit);
        if (charset) return charset;
      } else if (isAlpha(c1)) {
        i += skipTag(uint8Array, i + 2, limit);
      } else if (isSpecialTag(c1)) {
        i += skipSpecialTag(uint8Array, i + 2, limit);
      }
    }
  }
  return null;
}

function skipComment(uint8Array, i, limit) {
  for (; i < limit; i++) {
    if (uint8Array[i] === 0x3E && uint8Array[i - 1] === 0x2D && uint8Array[i - 2] === 0x2D) {
      break;
    }
  }
  return i;
}

function matchesMetaTag(c1, c2, c3, c4, c5) {
  return (c1 === 0x4D || c1 === 0x6D) && 
         (c2 === 0x45 || c2 === 0x65) && 
         (c3 === 0x54 || c3 === 0x74) && 
         (c4 === 0x41 || c4 === 0x61) && 
         (isSpaceCharacter(c5) || c5 === 0x2F);
}

function extractCharsetFromMeta(uint8Array, i, limit) {
  const attributes = new Map();
  let gotPragma = false, needPragma = null, charset = null;

  while (i < limit) {
    const attrRes = getAttribute(uint8Array, i, limit);
    if (!attrRes.attr) break;
    
    if (!attributes.has(attrRes.attr.name)) {
      attributes.set(attrRes.attr.name, attrRes.attr.value);
      
      if (attrRes.attr.name === "http-equiv") {
        gotPragma = attrRes.attr.value === "content-type";
      } else if (attrRes.attr.name === "content" && !charset) {
        charset = extractCharacterEncodingFromMeta(attrRes.attr.value);
        if (charset) needPragma = true;
      } else if (attrRes.attr.name === "charset") {
        charset = whatwgEncoding.labelToName(attrRes.attr.value);
        needPragma = false;
      }
    }
    i = attrRes.i;
  }

  if (charset === "UTF-16LE" || charset === "UTF-16BE") {
    charset = "UTF-8";
  } else if (charset === "x-user-defined") {
    charset = "windows-1252";
  }

  if ((needPragma && gotPragma) || needPragma === false) {
    return charset;
  }
  return null;
}

function skipTag(uint8Array, i, limit) {
  let c;
  while (i < limit && !isSpaceCharacter(c = uint8Array[i]) && c !== 0x3E) {
    i++;
  }
  return i - 2;
}

function skipSpecialTag(uint8Array, i, limit) {
  let c;
  while (i < limit && (c = uint8Array[i]) !== 0x3E) {
    i++;
  }
  return i - 2;
}

function isAlpha(c) {
  return (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A);
}

function isSpecialTag(c) {
  return c === 0x21 || c === 0x2F || c === 0x3F;
}

function getAttribute(uint8Array, i, limit) {
  while (i < limit) {
    let c = uint8Array[i];
    if (isSpaceCharacter(c) || c === 0x2F) continue;
    if (c === 0x3E) break;

    let name = "", value = "";
    for (; i < limit; i++) {
      c = uint8Array[i];
      if (c === 0x3D && name) {
        i++; break;
      }
      if (isSpaceCharacter(c)) {
        while (isSpaceCharacter(uint8Array[++i]));
        if (uint8Array[i] !== 0x3D) return { attr: { name }, i };
        i++; break;
      }
      if (c === 0x2F || c === 0x3E) return { attr: { name, value }, i };
      name += String.fromCharCode(c > 0x40 && c < 0x5B ? c + 0x20 : c);
    }
    
    i = skipSpaces(uint8Array, i, limit);

    if ((c = uint8Array[i]) === 0x22 || c === 0x27) {
      i = handleQuotedValue(uint8Array, ++i, limit, String.fromCharCode(c), value);
    } else if (c !== 0x3E) {
      value = collectUnquotedValue(uint8Array, i, limit, value);
    }

    while (!isSpaceCharacter(uint8Array[i]) && uint8Array[i] !== 0x3E) i++;
    return { attr: { name, value }, i };
  }
  return { i };
}

function skipSpaces(uint8Array, i, limit) {
  while (i < limit && isSpaceCharacter(uint8Array[i])) i++;
  return i;
}

function handleQuotedValue(uint8Array, i, limit, quote, value) {
  for (; i < limit; i++) {
    let c = uint8Array[i];
    if (c === quote.charCodeAt(0)) return i + 1;
    value += String.fromCharCode(c > 0x40 && c < 0x5B ? c + 0x20 : c);
  }
  return i;
}

function collectUnquotedValue(uint8Array, i, limit, value) {
  for (; i < limit && !isSpaceCharacter(uint8Array[i]) && uint8Array[i] !== 0x3E; i++) {
    let c = uint8Array[i];
    value += String.fromCharCode(c > 0x40 && c < 0x5B ? c + 0x20 : c);
  }
  return value;
}

function extractCharacterEncodingFromMeta(string) {
  let position = 0, index;

  while ((index = string.substring(position).search(/charset/ui)) !== -1) {
    let subPosition = position + index + "charset".length;
    while (isSpaceCharacter(string[subPosition].charCodeAt(0))) subPosition++;

    if (string[subPosition] !== "=") {
      position = subPosition - 1;
      continue;
    }

    subPosition++;
    while (isSpaceCharacter(string[subPosition].charCodeAt(0))) subPosition++;

    if (string[subPosition] === "\"" || string[subPosition] === "'") {
      const endQuoteIndex = string.indexOf(string[subPosition], subPosition + 1);
      return whatwgEncoding.labelToName(string.slice(subPosition + 1, endQuoteIndex));
    }

    const end = string.slice(subPosition).search(/\x09|\x0A|\x0C|\x0D|\x20|;/u);
    return whatwgEncoding.labelToName(string.slice(position, end !== -1 ? position + end : string.length));
  }
  return null;
}

function isSpaceCharacter(c) {
  return [0x09, 0x0A, 0x0C, 0x0D, 0x20].includes(c);
}

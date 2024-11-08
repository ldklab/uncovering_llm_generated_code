"use strict";
const whatwgEncoding = require("whatwg-encoding");

module.exports = (buffer, options = {}) => {
  const { transportLayerEncodingLabel, defaultEncoding = "windows-1252" } = options;
  let encoding = whatwgEncoding.getBOMEncoding(buffer);

  if (!encoding && transportLayerEncodingLabel) {
    encoding = whatwgEncoding.labelToName(transportLayerEncodingLabel);
  }
  
  if (!encoding) {
    encoding = prescanMetaCharset(buffer);
  }
  
  if (!encoding) {
    encoding = defaultEncoding;
  }
  
  return encoding;
};

function prescanMetaCharset(buffer) {
  const limit = Math.min(buffer.length, 1024);
  for (let i = 0; i < limit; i++) {
    let c = buffer[i];
    if (c === 0x3C) {
      const [c1, c2, c3, c4, c5] = buffer.slice(i+1, i+6);
      if (c1 === 0x21 && c2 === 0x2D && c3 === 0x2D) {
        i = processComment(buffer, i + 4, limit);
      } else if (isMetaTagStart(c1, c2, c3, c4, c5)) {
        i = processMeta(buffer, i + 6, limit);
      } else if (isAlpha(c1)) {
        i = skipAlphaTag(buffer, i + 2, limit);
      } else if (c1 === 0x21 || c1 === 0x2F || c1 === 0x3F) {
        i = skipSpecialTag(buffer, i + 2, limit);
      }
    }
  }
  return null;
}

function processComment(buffer, i, limit) {
  for (; i < limit; i++) {
    if (buffer[i] === 0x3E && buffer[i-1] === 0x2D && buffer[i-2] === 0x2D) {
      break;
    }
  }
  return i;
}

function processMeta(buffer, i, limit) {
  const attributeList = new Set();
  let gotPragma = false;
  let needPragma = null;
  let charset = null;

  let attrRes;
  do {
    attrRes = getAttribute(buffer, i, limit);
    if (attrRes.attr && !attributeList.has(attrRes.attr.name)) {
      attributeList.add(attrRes.attr.name);
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
  } while (attrRes.attr);

  if (needPragma === null || (needPragma && !gotPragma) || !charset) {
    return i;
  }

  if (charset === "UTF-16LE" || charset === "UTF-16BE") {
    charset = "UTF-8";
  }
  if (charset === "x-user-defined") {
    charset = "windows-1252";
  }

  return charset ? charset : i;
}

function skipAlphaTag(buffer, i, limit) {
  for (; i < limit; i++) {
    if (isSpaceCharacter(buffer[i]) || buffer[i] === 0x3E) {
      break;
    }
  }
  let attrRes;
  do {
    attrRes = getAttribute(buffer, i, limit);
    i = attrRes.i;
  } while (attrRes.attr);
  return i;
}

function skipSpecialTag(buffer, i, limit) {
  for (; i < limit; i++) {
    if (buffer[i] === 0x3E) {
      break;
    }
  }
  return i;
}

function getAttribute(buffer, i, limit) {
  for (; i < limit; i++) {
    let c = buffer[i];
    if (isSpaceCharacter(c) || c === 0x2F) {
      continue;
    }
    if (c === 0x3E) {
      break;
    }
    let name = "", value = "";
    name = fetchAttrName(buffer, i, limit, name);
    i = name.nextIndex;
    c = buffer[i];
    if (isSpaceCharacter(c)) {
      i = skipSpace(buffer, i, limit);
    }
    if (buffer[i] === 0x22 || buffer[i] === 0x27) {
      [value, i] = fetchQuotedValue(buffer, i, limit, buffer[i]);
    } else {
      [value, i] = fetchUnquotedValue(buffer, i, limit);
    }
    return { attr: { name: name.text, value }, i };
  }
  return { i };
}

function fetchAttrName(buffer, i, limit, name) {
  for (; i < limit; i++) {
    let c = buffer[i];
    if (c === 0x3D && name) {
      i++;
      break;
    }
    if (isSpaceCharacter(c)) {
      i = skipSpace(buffer, i, limit);
      if (buffer[i] !== 0x3D) {
        return { text: name, nextIndex: i };
      }
    }
    if (c === 0x2F || c === 0x3E) {
      return { text: name, nextIndex: i };
    }
    name += String.fromCharCode(c >= 0x41 && c <= 0x5A ? c + 0x20 : c);
  }
  return { text: name, nextIndex: i };
}

function skipSpace(buffer, i, limit) {
  for (; i < limit; i++) {
    if (!isSpaceCharacter(buffer[i])) {
      break;
    }
  }
  return i;
}

function fetchQuotedValue(buffer, i, limit, quote) {
  let value = "";
  for (i++; i < limit; i++) {
    let c = buffer[i];
    if (c === quote) {
      i++;
      break;
    }
    value += String.fromCharCode(c >= 0x41 && c <= 0x5A ? c + 0x20 : c);
  }
  return [value, i];
}

function fetchUnquotedValue(buffer, i, limit) {
  let value = "";
  for (; i < limit; i++) {
    let c = buffer[i];
    if (isSpaceCharacter(c) || c === 0x3E) {
      break;
    }
    value += String.fromCharCode(c >= 0x41 && c <= 0x5A ? c + 0x20 : c);
  }
  return [value, i];
}

function extractCharacterEncodingFromMeta(string) {
  let position = 0;
  while (true) {
    const indexOfCharset = string.substring(position).search(/charset/i);
    if (indexOfCharset === -1) {
      return null;
    }
    let subPosition = position + indexOfCharset + "charset".length;
    while (isSpaceCharacter(string[subPosition].charCodeAt(0))) {
      ++subPosition;
    }
    if (string[subPosition] !== "=") {
      position = subPosition - 1;
      continue;
    }
    ++subPosition;
    while (isSpaceCharacter(string[subPosition].charCodeAt(0))) {
      ++subPosition;
    }
    position = subPosition;
    break;
  }
  if (string[position] === "\"" || string[position] === "'") {
    const nextIndex = string.indexOf(string[position], position + 1);
    if (nextIndex !== -1) {
      return whatwgEncoding.labelToName(string.substring(position + 1, nextIndex));
    }
    return null;
  }
  if (string.length === position + 1) {
    return null;
  }
  const end = string.substr(position + 1).search(/\x09|\x0A|\x0C|\x0D|\x20|;/) + position + 1;
  return whatwgEncoding.labelToName(string.substring(position, end));
}

function isSpaceCharacter(c) {
  return c === 0x09 || c === 0x0A || c === 0x0C || c === 0x0D || c === 0x20;
}

function isMetaTagStart(c1, c2, c3, c4, c5) {
  return ((c1 === 0x4D || c1 === 0x6D) &&
          (c2 === 0x45 || c2 === 0x65) &&
          (c3 === 0x54 || c3 === 0x74) &&
          (c4 === 0x41 || c4 === 0x61) &&
          (isSpaceCharacter(c5) || c5 === 0x2F));
}

function isAlpha(c) {
  return (c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A);
}

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
  const maxScanLength = Math.min(buffer.length, 1024);
  for (let i = 0; i < maxScanLength; i++) {
    let currentByte = buffer[i];
    if (currentByte === 0x3C) { // "<"
      const nextBytes = [buffer[i + 1], buffer[i + 2], buffer[i + 3], buffer[i + 4], buffer[i + 5]];

      if (nextBytes[0] === 0x21 && nextBytes[1] === 0x2D && nextBytes[2] === 0x2D) {
        i += 4;
        for (; i < maxScanLength; i++) {
          currentByte = buffer[i];
          const previousBytes = [buffer[i - 2], buffer[i - 1]];
          if (currentByte === 0x3E && previousBytes[1] === 0x2D && previousBytes[0] === 0x2D) {
            break;
          }
        }
      } else if (isMetaTagStart(nextBytes)) {
        i += 6;
        const attrList = new Set();
        let pragmaFound = false;
        let requiresPragma = null;
        let detectedCharset = null;

        let attrResult;
        do {
          attrResult = getAttribute(buffer, i, maxScanLength);
          if (attrResult.attr && !attrList.has(attrResult.attr.name)) {
            attrList.add(attrResult.attr.name);

            const { name, value } = attrResult.attr;

            if (name === "http-equiv") {
              pragmaFound = value === "content-type";
            } else if (name === "content" && !detectedCharset) {
              detectedCharset = extractCharacterEncodingFromMeta(value);
              if (detectedCharset !== null) {
                requiresPragma = true;
              }
            } else if (name === "charset") {
              detectedCharset = whatwgEncoding.labelToName(value);
              requiresPragma = false;
            }
          }
          i = attrResult.i;
        } while (attrResult.attr);

        if (requiresPragma === false || (requiresPragma === true && pragmaFound === true)) {
          return handleSpecialCharsets(detectedCharset);
        }
      } else if (isAlphaCharacter(nextBytes[0])) {
        for (i += 2; i < maxScanLength; i++) {
          currentByte = buffer[i];
          if (isSpaceCharacter(currentByte) || currentByte === 0x3E) {
            break;
          }
        }
        let attrResult;
        do {
          attrResult = getAttribute(buffer, i, maxScanLength);
          i = attrResult.i;
        } while (attrResult.attr);
      } else if (isSpecialCharacter(nextBytes[0])) {
        for (i += 2; i < maxScanLength; i++) {
          currentByte = buffer[i];
          if (currentByte === 0x3E) {
            break;
          }
        }
      }
    }
  }
  return null;
}

function getAttribute(buffer, i, length) {
  while (i < length) {
    let currentByte = buffer[i];
    if (isSpaceCharacter(currentByte) || currentByte === 0x2F) {
      i++;
      continue;
    }
    if (currentByte === 0x3E) {
      break;
    }

    let name = "";
    let value = "";
    
    nameLoop: while (i < length) {
      currentByte = buffer[i];
      if (currentByte === 0x3D && name) {
        i++;
        break;
      }
      if (isSpaceCharacter(currentByte)) {
        i++;
        continue;
      }
      if (currentByte === 0x2F || currentByte === 0x3E) {
        return { attr: { name, value }, i };
      }

      name += toLowerCaseCharacter(currentByte);
      i++;
    }

    currentByte = buffer[i];
    if (isSpaceCharacter(currentByte)) {
      i = skipSpaces(buffer, i, length);
    }

    if (currentByte === 0x22 || currentByte === 0x27) {
      const quoteMark = currentByte;
      for (i++; i < length; i++) {
        currentByte = buffer[i];
        if (currentByte === quoteMark) {
          i++;
          return { attr: { name, value }, i };
        }
        value += toLowerCaseCharacter(currentByte);
      }
    }

    if (currentByte === 0x3E) {
      return { attr: { name, value }, i };
    }

    value += toLowerCaseCharacter(currentByte);
    i++;

    for (i++; i < length; i++) {
      currentByte = buffer[i];
      if (isSpaceCharacter(currentByte) || currentByte === 0x3E) {
        return { attr: { name, value }, i };
      }
      value += toLowerCaseCharacter(currentByte);
    }
  }
  return { i };
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

  const indexOfWhitespaceOrSemicolon = string.substring(position + 1).search(/\x09|\x0A|\x0C|\x0D|\x20|;/);
  const end = indexOfWhitespaceOrSemicolon === -1 ? string.length : position + indexOfWhitespaceOrSemicolon + 1;

  return whatwgEncoding.labelToName(string.substring(position, end));
}

function isMetaTagStart(bytes) {
  return (
    (bytes[0] === 0x4D || bytes[0] === 0x6D) &&
    (bytes[1] === 0x45 || bytes[1] === 0x65) &&
    (bytes[2] === 0x54 || bytes[2] === 0x74) &&
    (bytes[3] === 0x41 || bytes[3] === 0x61) &&
    (isSpaceCharacter(bytes[4]) || bytes[4] === 0x2F)
  );
}

function isAlphaCharacter(byte) {
  return (byte >= 0x41 && byte <= 0x5A) || (byte >= 0x61 && byte <= 0x7A);
}

function isSpecialCharacter(byte) {
  return byte === 0x21 || byte === 0x2F || byte === 0x3F;
}

function handleSpecialCharsets(charset) {
  if (charset === "UTF-16LE" || charset === "UTF-16BE") {
    return "UTF-8";
  }
  if (charset === "x-user-defined") {
    return "windows-1252";
  }
  return charset;
}

function isSpaceCharacter(c) {
  return c === 0x09 || c === 0x0A || c === 0x0C || c === 0x0D || c === 0x20;
}

function skipSpaces(buffer, index, length) {
  for (let i = index; i < length; i++) {
    if (!isSpaceCharacter(buffer[i])) {
      return i;
    }
  }
  return length;
}

function toLowerCaseCharacter(byte) {
  return (byte >= 0x41 && byte <= 0x5A) ? String.fromCharCode(byte + 0x20) : String.fromCharCode(byte);
}

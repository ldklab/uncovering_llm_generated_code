"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.readCodePoint = readCodePoint;
exports.readInt = readInt;
exports.readStringContents = readStringContents;

const isDigit = code => code >= 48 && code <= 57;

const forbiddenNumericSeparatorSiblings = {
  decBinOct: new Set([46, 66, 69, 79, 95, 98, 101, 111]),
  hex: new Set([46, 88, 95, 120])
};

const isAllowedNumericSeparatorSibling = {
  bin: ch => ch === 48 || ch === 49,
  oct: ch => ch >= 48 && ch <= 55,
  dec: ch => ch >= 48 && ch <= 57,
  hex: ch => (ch >= 48 && ch <= 57) || (ch >= 65 && ch <= 70) || (ch >= 97 && ch <= 102)
};

function readStringContents(type, input, pos, lineStart, curLine, errors) {
  const initialState = { pos, lineStart, curLine };
  let output = "", firstInvalidLoc = null, chunkStart = pos;

  while (true) {
    if (pos >= input.length) {
      errors.unterminated(initialState.pos, initialState.lineStart, initialState.curLine);
      output += input.slice(chunkStart, pos);
      break;
    }

    const ch = input.charCodeAt(pos);
    if (isStringEnd(type, ch, input, pos)) {
      output += input.slice(chunkStart, pos);
      break;
    }

    if (ch === 92) { // Backslash
      output += input.slice(chunkStart, pos);
      const res = readEscapedChar(input, pos, lineStart, curLine, type === "template", errors);
      if (res.ch === null && !firstInvalidLoc) {
        firstInvalidLoc = { pos, lineStart, curLine };
      } else {
        output += res.ch;
      }
      ({ pos, lineStart, curLine } = res);
      chunkStart = pos;
    } else if ([8232, 8233].includes(ch)) { // Line separators
      ++pos; ++curLine; lineStart = pos;
    } else if ([10, 13].includes(ch)) { // Newlines
      handleNewline();
    } else {
      ++pos;
    }
  }

  function handleNewline() {
    if (type === "template") {
      output += input.slice(chunkStart, pos) + "\n";
    } else {
      errors.unterminated(initialState.pos, initialState.lineStart, initialState.curLine);
    }
    ++pos;
    if (ch === 13 && input.charCodeAt(pos) === 10) ++pos;
    ++curLine; chunkStart = lineStart = pos;
  }

  return {
    pos, str: output, firstInvalidLoc, lineStart, curLine, containsInvalid: !!firstInvalidLoc
  };
}

function isStringEnd(type, ch, input, pos) {
  if (type === "template") {
    return ch === 96 || (ch === 36 && input.charCodeAt(pos + 1) === 123);
  }
  return ch === (type === "double" ? 34 : 39);
}

function readEscapedChar(input, pos, lineStart, curLine, inTemplate, errors) {
  const throwOnInvalid = !inTemplate;
  pos++;
  const res = ch => ({ pos, ch, lineStart, curLine });
  const ch = input.charCodeAt(pos++);

  switch (ch) {
    case 110: return res("\n");
    case 114: return res("\r");
    case 120:
      let xCode;
      ({ code: xCode, pos } = readHexChar(input, pos, lineStart, curLine, 2, false, throwOnInvalid, errors));
      return res(xCode === null ? null : String.fromCharCode(xCode));
    case 117:
      let uCode;
      ({ code: uCode, pos } = readCodePoint(input, pos, lineStart, curLine, throwOnInvalid, errors));
      return res(uCode === null ? null : String.fromCodePoint(uCode));
    case 116: return res("\t");
    case 98: return res("\b");
    case 118: return res("\u000b");
    case 102: return res("\f");
    case 13: if (input.charCodeAt(pos) === 10) ++pos;
    case 10: lineStart = pos; ++curLine;
    case 8232: case 8233: return res("");
    case 56: case 57:
      return inTemplate ? res(null) : (errors.strictNumericEscape(pos - 1, lineStart, curLine), res(null));
    default: return handleDefault(ch, inTemplate, pos, lineStart, curLine, errors);
  }
}

function handleDefault(ch, inTemplate, pos, lineStart, curLine, errors) {
  if (ch >= 48 && ch <= 55) {
    const startPos = pos - 1;
    const match = /^[0-7]+/.exec(input.slice(startPos, pos + 2));
    let octalStr = match[0];
    let octal = parseInt(octalStr, 8);

    if (octal > 255) {
      octalStr = octalStr.slice(0, -1);
      octal = parseInt(octalStr, 8);
    }
    pos += octalStr.length - 1;

    if (octalStr !== "0" || input.charCodeAt(pos) === 56 || input.charCodeAt(pos) === 57) {
      return inTemplate ? { pos, ch: null, lineStart, curLine } 
        : (errors.strictNumericEscape(startPos, lineStart, curLine), { pos, ch: null, lineStart, curLine });
    }

    return { pos, ch: String.fromCharCode(octal), lineStart, curLine };
  }
  return { pos, ch: String.fromCharCode(ch), lineStart, curLine };
}

function readHexChar(input, pos, lineStart, curLine, len, forceLen, throwOnInvalid, errors) {
  const initialPos = pos;
  let n;
  ({ n, pos } = readInt(input, pos, lineStart, curLine, 16, len, forceLen, false, errors, !throwOnInvalid));
  
  if (n === null) {
    if (throwOnInvalid) errors.invalidEscapeSequence(initialPos, lineStart, curLine);
    else pos = initialPos - 1;
  }
  return { code: n, pos };
}

function readInt(input, pos, lineStart, curLine, radix, len, forceLen, allowNumSeparator, errors, bailOnError) {
  const start = pos;
  const forbiddenSiblings = radix === 16 ? forbiddenNumericSeparatorSiblings.hex : forbiddenNumericSeparatorSiblings.decBinOct;
  const isAllowedSibling = isAllowedNumericSeparatorSibling[radix === 16 ? 'hex' : ['dec', 'oct', 'bin'][(radix >>> 3 || 2) % 3]];
  
  let invalid = false, total = 0;

  for (let i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    const code = input.charCodeAt(pos);
    let val;

    if (code === 95 && allowNumSeparator !== "bail") {
      processNumericSeparator();
      continue;
    }

    if (code >= 97) {
      val = code - 97 + 10;
    } else if (code >= 65) {
      val = code - 65 + 10;
    } else if (isDigit(code)) {
      val = code - 48;
    } else {
      val = Infinity;
    }

    if (val >= radix) {
      if (val <= 9 && bailOnError) return { n: null, pos };
      else if (val <= 9) errors.invalidDigit(pos, lineStart, curLine, radix);
      else if (forceLen) {
        val = 0; invalid = true;
      } else break;
    }

    ++pos;
    total = total * radix + val;
  }

  if (pos === start || (len != null && pos - start !== len) || invalid) return { n: null, pos };

  function processNumericSeparator() {
    const prev = input.charCodeAt(pos - 1), next = input.charCodeAt(pos + 1);
    if (!allowNumSeparator) {
      if (bailOnError) return { n: null, pos };
      errors.numericSeparatorInEscapeSequence(pos, lineStart, curLine);
    } else if (Number.isNaN(next) || !isAllowedSibling(next) || forbiddenSiblings.has(prev) || forbiddenSiblings.has(next)) {
      if (bailOnError) return { n: null, pos };
      errors.unexpectedNumericSeparator(pos, lineStart, curLine);
    }
    ++pos;
  }

  return { n: total, pos };
}

function readCodePoint(input, pos, lineStart, curLine, throwOnInvalid, errors) {
  const ch = input.charCodeAt(pos);
  let code;

  if (ch === 123) {
    ++pos;
    ({ code, pos } = readHexChar(input, pos, lineStart, curLine, input.indexOf("}", pos) - pos, true, throwOnInvalid, errors));
    ++pos;

    if (code !== null && code > 0x10ffff) {
      if (throwOnInvalid) errors.invalidCodePoint(pos, lineStart, curLine);
      else return { code: null, pos };
    }
  } else {
    ({ code, pos } = readHexChar(input, pos, lineStart, curLine, 4, false, throwOnInvalid, errors));
  }

  return { code, pos };
}

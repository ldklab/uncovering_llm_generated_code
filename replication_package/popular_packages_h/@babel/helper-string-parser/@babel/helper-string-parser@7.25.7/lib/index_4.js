"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.readCodePoint = readCodePoint;
exports.readInt = readInt;
exports.readStringContents = readStringContents;

// Helper function to check if a character code corresponds to a digit (0-9)
function isDigit(code) {
  return code >= 48 && code <= 57;
}

// Sets defining forbidden numeric separator siblings for different numeric types
const forbiddenNumericSeparatorSiblings = {
  decBinOct: new Set([46, 66, 69, 79, 95, 98, 101, 111]),
  hex: new Set([46, 88, 95, 120])
};

// Functions to check if a character is allowed as a numeric separator sibling
const isAllowedNumericSeparatorSibling = {
  bin: ch => ch === 48 || ch === 49, // 0 or 1 for binary
  oct: ch => ch >= 48 && ch <= 55,   // 0-7 for octal
  dec: ch => ch >= 48 && ch <= 57,   // 0-9 for decimal
  hex: ch => ch >= 48 && ch <= 57 || (ch >= 65 && ch <= 70) || (ch >= 97 && ch <= 102) // 0-9, A-F, a-f for hex
};

// Read string contents considering escape characters, string termination, and invalidity
function readStringContents(type, input, pos, lineStart, curLine, errors) {
  const initialPos = pos;
  const initialLineStart = lineStart;
  const initialCurLine = curLine;
  let out = "";
  let firstInvalidLoc = null;
  let chunkStart = pos;
  const { length } = input;

  while (true) {
    if (pos >= length) {
      errors.unterminated(initialPos, initialLineStart, initialCurLine);
      out += input.slice(chunkStart, pos);
      break;
    }

    const ch = input.charCodeAt(pos);
    if (isStringEnd(type, ch, input, pos)) {
      out += input.slice(chunkStart, pos);
      break;
    }

    if (ch === 92) { // Backslash \
      out += input.slice(chunkStart, pos);
      const res = readEscapedChar(input, pos, lineStart, curLine, type === "template", errors);
      if (res.ch === null && !firstInvalidLoc) {
        firstInvalidLoc = { pos, lineStart, curLine };
      } else {
        out += res.ch;
      }
      ({ pos, lineStart, curLine } = res);
      chunkStart = pos;
    } else if (ch === 8232 || ch === 8233) { // Line separator or paragraph separator
      ++pos;
      ++curLine;
      lineStart = pos;
    } else if (ch === 10 || ch === 13) { // Newline or Carriage return
      if (type === "template") {
        out += input.slice(chunkStart, pos) + "\n";
        ++pos;
        if (ch === 13 && input.charCodeAt(pos) === 10) {
          ++pos;
        }
        ++curLine;
        chunkStart = lineStart = pos;
      } else {
        errors.unterminated(initialPos, initialLineStart, initialCurLine);
      }
    } else {
      ++pos;
    }
  }

  return {
    pos,
    str: out,
    firstInvalidLoc,
    lineStart,
    curLine,
    containsInvalid: !!firstInvalidLoc
  };
}

// Determine if the current character signifies the end of the string
function isStringEnd(type, ch, input, pos) {
  if (type === "template") {
    return ch === 96 || (ch === 36 && input.charCodeAt(pos + 1) === 123);
  }
  return ch === (type === "double" ? 34 : 39); // 34 is ", 39 is '
}

// Handle escape characters and return the resulting character
function readEscapedChar(input, pos, lineStart, curLine, inTemplate, errors) {
  const throwOnInvalid = !inTemplate;
  pos++;
  const res = ch => ({ pos, ch, lineStart, curLine });
  const ch = input.charCodeAt(pos++);
  let code, startPos, match, octalStr, octal, next;

  switch (ch) {
    case 110: return res("\n");     // \n Newline
    case 114: return res("\r");     // \r Carriage return
    case 120:                       // \xHH
      ({ code, pos } = readHexChar(input, pos, lineStart, curLine, 2, false, throwOnInvalid, errors));
      return res(code === null ? null : String.fromCharCode(code));
    case 117:                       // \uFFFF or \u{X}
      ({ code, pos } = readCodePoint(input, pos, lineStart, curLine, throwOnInvalid, errors));
      return res(code === null ? null : String.fromCodePoint(code));
    case 116: return res("\t");     // \t Tab
    case 98:  return res("\b");     // \b Backspace
    case 118: return res("\u000b"); // \v Vertical tab
    case 102: return res("\f");     // \f Form feed
    case 13:                    // \r (handle as newline)
      if (input.charCodeAt(pos) === 10) ++pos;
    case 10:                    // \n
      lineStart = pos;
      ++curLine;
    case 8232:
    case 8233:                  // Line separator or Paragraph separator
      return res("");
    case 56: 
    case 57:                    // Octal escapes (8,9) are illegal in strict mode 
      if (inTemplate) {
        return res(null);
      } else {
        errors.strictNumericEscape(pos - 1, lineStart, curLine);
      }
    default:
      if (ch >= 48 && ch <= 55) { // Valid octal literal
        startPos = pos - 1;
        match = /^[0-7]+/.exec(input.slice(startPos, pos + 2));
        octalStr = match[0];
        octal = parseInt(octalStr, 8);

        if (octal > 255) {
          octalStr = octalStr.slice(0, -1);
          octal = parseInt(octalStr, 8);
        }

        pos += octalStr.length - 1;
        next = input.charCodeAt(pos);

        if (octalStr !== "0" || next === 56 || next === 57) {
          if (inTemplate) {
            return res(null);
          } else {
            errors.strictNumericEscape(startPos, lineStart, curLine);
          }
        }
        return res(String.fromCharCode(octal));
      }
      return res(String.fromCharCode(ch));
  }
}

// Read a hexadecimal character sequence
function readHexChar(input, pos, lineStart, curLine, len, forceLen, throwOnInvalid, errors) {
  const initialPos = pos;
  let n;
  ({ n, pos } = readInt(input, pos, lineStart, curLine, 16, len, forceLen, false, errors, !throwOnInvalid));

  if (n === null) {
    if (throwOnInvalid) {
      errors.invalidEscapeSequence(initialPos, lineStart, curLine);
    } else {
      pos = initialPos - 1;
    }
  }

  return { code: n, pos };
}

// Read an integer sequence from a given position, radix, and constraints
function readInt(input, pos, lineStart, curLine, radix, len, forceLen, allowNumSeparator, errors, bailOnError) {
  const start = pos;
  const forbiddenSiblings = radix === 16 ? forbiddenNumericSeparatorSiblings.hex : forbiddenNumericSeparatorSiblings.decBinOct;
  const isAllowedSibling = radix === 16 ? isAllowedNumericSeparatorSibling.hex : radix === 10 ? isAllowedNumericSeparatorSibling.dec : radix === 8 ? isAllowedNumericSeparatorSibling.oct : isAllowedNumericSeparatorSibling.bin;
  let invalid = false;
  let total = 0;

  for (let i = 0, e = len == null ? Infinity : len; i < e; ++i) {
    const code = input.charCodeAt(pos);
    let val;

    if (code === 95 && allowNumSeparator !== "bail") { // Numeric Separator '_'
      const prev = input.charCodeAt(pos - 1);
      const next = input.charCodeAt(pos + 1);

      if (!allowNumSeparator) {
        if (bailOnError) return { n: null, pos };
        errors.numericSeparatorInEscapeSequence(pos, lineStart, curLine);
      } else if (Number.isNaN(next) || !isAllowedSibling(next) || forbiddenSiblings.has(prev) || forbiddenSiblings.has(next)) {
        if (bailOnError) return { n: null, pos };
        errors.unexpectedNumericSeparator(pos, lineStart, curLine);
      }
      ++pos;
      continue;
    }

    if (code >= 97) val = code - 97 + 10; // a-f
    else if (code >= 65) val = code - 65 + 10; // A-F
    else if (isDigit(code)) val = code - 48; // 0-9
    else val = Infinity;

    if (val >= radix) {
      if (val <= 9 && bailOnError) {
        return { n: null, pos };
      } else if (val <= 9 && errors.invalidDigit(pos, lineStart, curLine, radix)) {
        val = 0;
      } else if (forceLen) {
        val = 0;
        invalid = true;
      } else {
        break;
      }
    }

    ++pos;
    total = total * radix + val;
  }

  if (pos === start || (len != null && pos - start !== len) || invalid) {
    return { n: null, pos };
  }

  return { n: total, pos };
}

// Read a Unicode code point from a string
function readCodePoint(input, pos, lineStart, curLine, throwOnInvalid, errors) {
  const ch = input.charCodeAt(pos);
  let code;

  if (ch === 123) { // Opening brace for \u{X...}
    ++pos;
    ({ code, pos } = readHexChar(input, pos, lineStart, curLine, input.indexOf("}", pos) - pos, true, throwOnInvalid, errors));
    ++pos;

    if (code !== null && code > 0x10ffff) {
      if (throwOnInvalid) {
        errors.invalidCodePoint(pos, lineStart, curLine);
      } else {
        return { code: null, pos };
      }
    }
  } else {
    ({ code, pos } = readHexChar(input, pos, lineStart, curLine, 4, false, throwOnInvalid, errors));
  }

  return { code, pos };
}

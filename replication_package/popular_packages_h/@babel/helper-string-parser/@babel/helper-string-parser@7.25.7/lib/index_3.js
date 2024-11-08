"use strict";

// Define exports for key functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCodePoint = readCodePoint;
exports.readInt = readInt;
exports.readStringContents = readStringContents;

// Check if a character code corresponds to a digit (0-9)
function isDigit(code) {
  return code >= 48 && code <= 57;
}

// Define forbidden siblings for numeric separators
const forbiddenNumericSeparatorSiblings = {
  decBinOct: new Set([46, 66, 69, 79, 95, 98, 101, 111]),
  hex: new Set([46, 88, 95, 120])
};

// Define allowed siblings next to numeric separators based on number type
const isAllowedNumericSeparatorSibling = {
  bin: ch => ch === 48 || ch === 49,
  oct: ch => ch >= 48 && ch <= 55,
  dec: ch => ch >= 48 && ch <= 57,
  hex: ch => (ch >= 48 && ch <= 57) || (ch >= 65 && ch <= 70) || (ch >= 97 && ch <= 102)
};

// Function to read the contents of a string based on its type
function readStringContents(type, input, pos, lineStart, curLine, errors) {
  const initialPos = pos, initialLineStart = lineStart, initialCurLine = curLine;
  let out = "", firstInvalidLoc = null, chunkStart = pos;
  const { length } = input;
  
  for (;;) {
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

    if (ch === 92) { // Backslash for escaped characters
      out += input.slice(chunkStart, pos);
      const res = readEscapedChar(input, pos, lineStart, curLine, type === "template", errors);
      if (res.ch === null && !firstInvalidLoc) {
        firstInvalidLoc = { pos, lineStart, curLine };
      } else {
        out += res.ch;
      }
      ({ pos, lineStart, curLine } = res);
      chunkStart = pos;
    } else if (ch === 8232 || ch === 8233) {
      ++pos; ++curLine; lineStart = pos;
    } else if (ch === 10 || ch === 13) {
      if (type === "template") {
        out += input.slice(chunkStart, pos) + "\n"; ++pos;
        if (ch === 13 && input.charCodeAt(pos) === 10) ++pos;
        ++curLine; chunkStart = lineStart = pos;
      } else {
        errors.unterminated(initialPos, initialLineStart, initialCurLine);
      }
    } else {
      ++pos;
    }
  }
  
  return { pos, str: out, firstInvalidLoc, lineStart, curLine, containsInvalid: !!firstInvalidLoc };
}

// Determine if current character marks the end of a string
function isStringEnd(type, ch, input, pos) {
  if (type === "template") {
    return ch === 96 || (ch === 36 && input.charCodeAt(pos + 1) === 123);
  }
  return ch === (type === "double" ? 34 : 39);
}

// Read an escaped character and return updates
function readEscapedChar(input, pos, lineStart, curLine, inTemplate, errors) {
  const throwOnInvalid = !inTemplate;
  ++pos;  // Skip backslash
  const res = ch => ({ pos, ch, lineStart, curLine });
  const ch = input.charCodeAt(pos++);
  
  switch (ch) {
    case 110: return res("\n");   // '\n' newline
    case 114: return res("\r");   // '\r' carriage return
    case 120:  // '\x' hexadecimal escape
      const { code, pos: newPos } = readHexChar(input, pos, lineStart, curLine, 2, false, throwOnInvalid, errors);
      return res(code === null ? null : String.fromCharCode(code));
    case 117:  // '\u' Unicode escape
      const { code: uCode, pos: newUPos } = readCodePoint(input, pos, lineStart, curLine, throwOnInvalid, errors);
      return res(uCode === null ? null : String.fromCodePoint(uCode));
    case 116: return res("\t");  // '\t' tab
    case 98: return res("\b");   // '\b' backspace
    case 118: return res("\v");  // '\v' vertical tab
    case 102: return res("\f");  // '\f' form feed
    case 13:   // Handle newline (\r\n or \n)
      if (input.charCodeAt(pos) === 10) ++pos;
    case 10: case 8232: case 8233:  // Newline sequence
      lineStart = pos; ++curLine; return res("");
    case 56: case 57:  // Invalid octal escape in strict mode
      if (inTemplate) return res(null);
      errors.strictNumericEscape(pos - 1, lineStart, curLine);
    default:
      if (ch >= 48 && ch <= 55) { // Octal escape
        const start = pos - 1;
        const match = /^[0-7]+/.exec(input.slice(start, pos + 2));
        let octalStr = match[0], octal = parseInt(octalStr, 8);
        if (octal > 255) {
          octalStr = octalStr.slice(0, -1); octal = parseInt(octalStr, 8);
        }
        pos += octalStr.length - 1;
        const next = input.charCodeAt(pos);
        if (octalStr !== "0" || next === 56 || next === 57) {
          if (inTemplate) return res(null);
          errors.strictNumericEscape(start, lineStart, curLine);
        }
        return res(String.fromCharCode(octal));
      }
      return res(String.fromCharCode(ch));
  }
}

// Read a hexadecimal character sequence
function readHexChar(input, pos, lineStart, curLine, len, forceLen, throwOnInvalid, errors) {
  const initialPos = pos;
  const { n, pos: newPos } = readInt(input, pos, lineStart, curLine, 16, len, forceLen, false, errors, !throwOnInvalid);
  if (n === null && throwOnInvalid) {
    errors.invalidEscapeSequence(initialPos, lineStart, curLine);
  }
  return { code: n, pos: newPos };
}

// Read integers from the input based on radix
function readInt(input, pos, lineStart, curLine, radix, len, forceLen, allowNumSeparator, errors, bailOnError) {
  const start = pos;
  const forbiddenSiblings = radix === 16 ? forbiddenNumericSeparatorSiblings.hex : forbiddenNumericSeparatorSiblings.decBinOct;
  const isAllowedSibling = radix === 16 ? isAllowedNumericSeparatorSibling.hex 
    : radix === 10 ? isAllowedNumericSeparatorSibling.dec 
    : radix === 8 ? isAllowedNumericSeparatorSibling.oct 
    : isAllowedNumericSeparatorSibling.bin;
  
  let invalid = false, total = 0;
  
  for (let i = 0, end = len == null ? Infinity : len; i < end; ++i) {
    const code = input.charCodeAt(pos);
    let val;
    if (code === 95 && allowNumSeparator !== "bail") {  // Numeric separator '_'
      const prev = input.charCodeAt(pos - 1);
      const next = input.charCodeAt(pos + 1);
      if (!allowNumSeparator) {
        if (bailOnError) return { n: null, pos };
        errors.numericSeparatorInEscapeSequence(pos, lineStart, curLine);
      } else if (Number.isNaN(next) || !isAllowedSibling(next) || forbiddenSiblings.has(prev) || forbiddenSiblings.has(next)) {
        if (bailOnError) return { n: null, pos };
        errors.unexpectedNumericSeparator(pos, lineStart, curLine);
      }
      ++pos; continue;
    }
    if (code >= 97) { val = code - 97 + 10; } // 'a' - 'f'
    else if (code >= 65) { val = code - 65 + 10; } // 'A' - 'F'
    else if (isDigit(code)) { val = code - 48; } // '0' - '9'
    else { val = Infinity; }
    
    if (val >= radix) {
      if (val <= 9 && bailOnError) return { n: null, pos };
      else if (val <= 9 && errors.invalidDigit(pos, lineStart, curLine, radix)) val = 0;
      else if (forceLen) { val = 0; invalid = true; }
      else break;
    }
    ++pos;
    total = total * radix + val;
  }
  
  if (pos === start || (len != null && pos - start !== len) || invalid) {
    return { n: null, pos };
  }
  
  return { n: total, pos };
}

// Read a code point in a Unicode escape
function readCodePoint(input, pos, lineStart, curLine, throwOnInvalid, errors) {
  const ch = input.charCodeAt(pos);
  let code;
  
  if (ch === 123) { // '{' start of a code point
    ++pos;
    const { code: codeValue, pos: newPos } = readHexChar(input, pos, lineStart, curLine, input.indexOf("}", pos) - pos, true, throwOnInvalid, errors);
    ++pos;
    if (codeValue !== null && codeValue > 0x10ffff && throwOnInvalid) {
      errors.invalidCodePoint(pos, lineStart, curLine);
    } else {
      return { code: codeValue, pos };
    }
  } else {
    const { code: uCode, pos: newUPos } = readHexChar(input, pos, lineStart, curLine, 4, false, throwOnInvalid, errors);
    return { code: uCode, pos: newUPos };
  }
}

//# sourceMappingURL=index.js.map
